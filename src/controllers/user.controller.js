import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOncloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { deleteOldImage } from "../utils/deleteOldImage.js"
import mongoose from "mongoose"

// PRODUCTION COOKIE CONFIGURATION OVERRIDE
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,      
    sameSite: "none",   
    path: "/"
};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        console.log("Token Generation Error: ", error)
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

// 1. REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
    const { email, username, fullName, password } = req.body;

    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields (fullName, email, username, password) are strictly required");
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedUsername = username.trim().toLowerCase();

    if (sanitizedEmail === "" || sanitizedUsername === "" || fullName.trim() === "" || password.trim() === "") {
        throw new ApiError(400, "Fields cannot be empty or just spaces");
    }

    if (!sanitizedEmail.includes("@")) {
        throw new ApiError(400, "Invalid email structure: '@' is required");
    }

    const existedUser = await User.findOne({
        $or: [
            { email: sanitizedEmail },
            { username: sanitizedUsername }
        ]
    });

    if (existedUser) {
        throw new ApiError(409, `User with email '${sanitizedEmail}' or username '${sanitizedUsername}' already exists`);
    }

    const avatarBuffer = req.files?.avatar?.[0]?.buffer;
    const coverImageBuffer = req.files?.coverImage?.[0]?.buffer;

    if (!avatarBuffer) {
        throw new ApiError(400, "Avatar file stream buffer is required to build a channel");
    }

    const avatar = await uploadOncloudinary(avatarBuffer);
    
    let coverImage = null;
    if (coverImageBuffer) {
        coverImage = await uploadOncloudinary(coverImageBuffer);
    }

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed on Cloudinary cloud server.");
    }

    const user = await User.create({
        username: sanitizedUsername,
        email: sanitizedEmail,
        fullName: fullName.trim(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "", 
        password, 
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user on MongoDB cloud database");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// 2. LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, emailOrUsername, password } = req.body

    let authIdentifier = emailOrUsername || email || username;

    if (!authIdentifier) {
        throw new ApiError(400, "Username or Email is required")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [
            { username: authIdentifier.trim().toLowerCase() }, 
            { email: authIdentifier.trim().toLowerCase() }
        ]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isValidPassword = await user.isPasswordCorrect(password)

    if (!isValidPassword) {
        throw new ApiError(401, "Invalid user password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, 
                    accessToken, 
                    refreshToken
                },
                "User logged in successfully"
            )
        )
});

// 3. LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { returnDocument: 'after' }
    )

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(
            new ApiResponse(200, {}, "user logged out successfully")
        )
});

// 4. REFRESH ACCESS TOKEN (HEADER COMPATIBLE ENHANCED)
const refreshAccessToken = asyncHandler(async (req, res) => {
    // 🟢 FREE CLOUD INJECTION TRAFFIC ACCELERATOR: Try extracting tokens from cookies, bodies, or header structures safely
    const incomingRefreshToken = 
        req.cookies?.refreshToken || 
        req.body?.refreshToken || 
        req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized token mapping loop request dropped");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid deployment refresh session token context");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token token sequence is expired or already processed");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access session authorization tokens refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Fatal runtime crash inside refresh token module");
    }
});

// 5. FORGET/CHANGE PASSWORD
const forgetPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "old password is incorrect")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false }) 

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password change successfully"))
});

// 6. GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "user fetched successfully"))
});

// 7. UPDATE ACCOUNT DETAILS
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!(fullName || email)) {
        throw new ApiError(400, "all fields are required")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        { returnDocument: 'after' }
    ).select("-password -refreshToken") 

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "fullName changed successfully")) 
});

// 8. UPDATE AVATAR
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarBuffer = req.file?.buffer;

    if (!avatarBuffer) {
        throw new ApiError(400, "Avatar file stream is completely missing in request body");
    }

    const userProfile = await User.findById(req.user?._id);
    const oldAvatarUrl = userProfile?.avatar;

    try {
        const avatar = await uploadOncloudinary(avatarBuffer);

        if (!avatar) {
            throw new ApiError(400, "Error while uploading avatar file to Cloudinary storage server");
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            { $set: { avatar: avatar.url } },
            { returnDocument: 'after' }
        ).select("-password");

        if (oldAvatarUrl) {
            try {
                await deleteOldImage(oldAvatarUrl);
            } catch (err) {
                console.log("Cloud old asset cleanup deferred safely.");
            }
        }

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Avatar image updated successfully"));
            
    } catch (error) {
        console.error("Critical error inside avatar memory handler:", error);
        throw new ApiError(500, error?.message || "Internal server error during avatar update");
    }
});

// 9. UPDATE COVER IMAGE
const updateUserCoverimage = asyncHandler(async (req, res) => {
    const coverBuffer = req.file?.buffer;

    if (!coverBuffer) {
        throw new ApiError(400, "Cover image file stream is completely missing in request body");
    }

    const userProfile = await User.findById(req.user?._id);
    const oldCoverUrl = userProfile?.coverImage;

    try {
        const coverImage = await uploadOncloudinary(coverBuffer);

        if (!coverImage) {
            throw new ApiError(400, "Error while uploading cover artwork to Cloudinary storage server");
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            { $set: { coverImage: coverImage.url } },
            { returnDocument: 'after' }
        ).select("-password");

        if (oldCoverUrl) {
            try {
                await deleteOldImage(oldCoverUrl);
            } catch (err) {
                console.log("Cloud old cover cleaning deferred safely.");
            }
        }

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Cover artwork updated successfully"));

    } catch (error) {
        console.error("Critical error inside cover image memory handler:", error);
        throw new ApiError(500, error?.message || "Internal server error during cover image update");
    }
});

// 10. GET CHANNEL PROFILE
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase().trim(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            },
        },
        {
            $addFields: {
                subscriberCount: { $size: "$subscribers" },
                channelSubscriberToCount: { $size: "$subscribedTo" },
                issubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelSubscriberToCount: 1,
                issubscribed: 1,
            }
        },
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "channel user fetched successfully"))
});

// 11. WATCH HISTORY PIPELINES
const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $push: { watchHistory: { video: videoId, watchedAt: new Date() } }
        }
    );

    return res.status(200).json(new ApiResponse(200, {}, "History updated"));
});

// GET WATCH HISTORY PIPELINE
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: req.user?._id 
            }
        },
        {
            $unwind: {
                path: "$watchHistory",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory.video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $addFields: {
                "videoDetails.updatedAt": "$watchHistory.watchedAt" 
            }
        },
        {
            $group: {
                _id: "$_id",
                watchHistory: { $push: "$videoDetails" }
            }
        }
    ]);

    const finalHistoryArray = user[0]?.watchHistory || [];
    const reverseChronologicalHistory = [...finalHistoryArray].reverse();

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            reverseChronologicalHistory, 
            "watch history fetched successfully"
        ))
});

const clearWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { watchHistory: [] } },
        { returnDocument: 'after' }
    );

    if (!user) {
        throw new ApiError(404, "User not found");  
    }

    return res  
        .status(200)
        .json(new ApiResponse(200, {}, "watch history cleared successfully"))
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgetPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserCoverimage,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory,
    clearWatchHistory,
    addToWatchHistory
}