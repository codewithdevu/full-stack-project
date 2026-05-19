import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOncloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { deleteOldImage } from "../utils/deleteOldImage.js"
import mongoose from "mongoose"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    }
    catch (error) {
        console.log("Original Error: ", error)
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // 1. Get user details from frontend safely
    const { email, username, fullName, password } = req.body;

    // 2. 🟢 ROBUST VALIDATION: Pehle check karo ki fields physically exist karti hain ya nahi
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields (fullName, email, username, password) are required");
    }

    if ([fullName, email, username, password].some((field) => String(field).trim() === "")) {
        throw new ApiError(400, "Fields cannot be empty spaces");
    }

    if (!email.includes("@")) {
        throw new ApiError(400, "@ is required in email structure");
    }

    // 3. Lowercase normalization (Conflict safety)
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedUsername = username.trim().toLowerCase();

    // 4. Check if user already exists in MongoDB Atlas
    const existedUser = await User.findOne({
        $or: [{ email: sanitizedEmail }, { username: sanitizedUsername }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    // 5. Check for files safely using optional chaining (Adapts to /tmp on Vercel or local path)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required to build a channel");
    }

    // 6. Upload to Cloudinary with strict adaptive wrappers
    const avatar = await uploadOncloudinary(avatarLocalPath);
    
    // Cover image optional h, tabhi hit karo jab path physical exist kare
    let coverImage = null;
    if (coverImageLocalPath) {
        coverImage = await uploadOncloudinary(coverImageLocalPath);
    }

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed on Cloudinary cloud server. Please try again.");
    }

    // 7. Create user object in Database
    const user = await User.create({
        username: sanitizedUsername,
        email: sanitizedEmail,
        fullName: fullName.trim(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // Fallback empty string if not provided
        password, // Hashing standard model level pre-save hook handle karega
    });

    // 8. Fetch clean user instance and exclude secure fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user on MongoDB cloud database");
    }

    // 9. Return clean successful response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// login user 

const loginUser = asyncHandler(async (req, res) => {
    // 1. req.body se email, username, ya agar frontend se single key 'emailOrUsername' aa rahi ho toh use nikalenge
    const { username, email, emailOrUsername, password } = req.body

    // 2. Teeno mein se jo bhi mil jaye use identifier bana lo (Foolproof check)
    let authIdentifier = emailOrUsername || email || username;

    if (!authIdentifier) {
        throw new ApiError(400, "Username or Email is required")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    // 3. Database mein check karein
    const user = await User.findOne({
        $or: [
            { username: authIdentifier.trim().toLowerCase() }, // Trim aur lowercase safe rakhne ke liye
            { email: authIdentifier.trim().toLowerCase() }
        ]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    // 4. Password validation
    const isValidPassword = await user.isPasswordCorrect(password)

    if (!isValidPassword) {
        throw new ApiError(401, "Invalid user password")
    }

    // 5. Token generation
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // 6. Secured user fetch
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Cookie configuration (Production ready)
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
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
})
// logout

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: undefined }
        },
        {
            returnDocument: 'after' // 'new: true' ki jagah ye likho
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out")
        )

})

// refresh accesss token

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})


// forget password

const forgetPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "old password is incorrect")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password change successfully"))
})

//find current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "user fetched successfully"))
})

// update user fullName and email
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName , email } = req.body
    // console.log("fullName" , fullName);
    

    if (!(fullName || email)) {
        throw new ApiError(400, "all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        {
            returnDocument: 'after'
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, {} , "fullName changed successfully"))
})

// update user avatar

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }

    try {
        const avatar = await uploadOncloudinary(avatarLocalPath)

        if (!avatar) {
            throw new ApiError(400, "error while uploading on avatar")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url
                }
            },
            {
                returnDocument: 'after'
            }
        ).select("-password")

        await deleteOldImage(avatarLocalPath)


        return res
            .status(200)
            .json(new ApiResponse(200, user, "avatar image uploaded"))
    } catch (error) {
        await deleteOldImage(avatarLocalPath)
        throw new ApiError(500, error?.message || "internal error while uploading avatar image")
    }
})


const updateUserCoverimage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file is missing")
    }

    try {
        const coverImage = await uploadOncloudinary(coverImageLocalPath)

        if (!coverImage.url) {
            throw new ApiError(400, "error while uploading on coverImage")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    coverImage: coverImage.url || ""
                }
            },
            {
                returnDocument: 'after'
            }
        ).select("-password")

        return res
            .status(200)
            .json(new ApiResponse(200, user, "cover image uploaded"))

        await deleteOldImage(coverImageLocalPath)

    } catch (error) {
        await deleteOldImage(coverImageLocalPath)

        throw new ApiError(500, error?.message || "internal server during cover image update")
    }
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username,
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
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelSubscriberToCount: {
                    $size: "$subscribedTo"
                },
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
    console.log("channel" , channel);
    

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "channel user fetched successfully"))
})

const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $addToSet: { watchHistory: videoId } // 🟢 Duplicate nahi hone dega
        }
    );

    return res.status(200).json(new ApiResponse(200, {}, "History updated"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json( new ApiResponse(
        200, 
        user[0]?.watchHistory, 
        "watch history fetched succcessfully"
    ))
})

const clearWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                watchHistory: []
            }
        },
        {new: true}
    );

    if (!user) {
      throw new ApiError(404, "User not found");  
    }

    return res  
    .status(200)
    .json(new ApiResponse(200, {}, "watch history cleared successfully"))
})

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