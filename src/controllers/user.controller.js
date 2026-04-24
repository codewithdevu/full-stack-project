import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOncloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend 
    // validation - not empty
    // check if user already exists : username, email 
    // check for images , check for avatar 
    // upload them to couldinary , avatar 
    // create user object- create entry token field from response
    // check for user creation 
    // return response

    // console.log("req.body: ", req.body);
    const { email, username, fullName, password } = req.body

    console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are reqiured")
    }

    if (!email.includes("@")) {
        throw new ApiError(400, "@ is reqiured in email")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username is already exists ")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    // console.log(req.files);


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOncloudinary(avatarLocalPath);
    const coverImage = await uploadOncloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
})

// login user 

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user 
    // password check
    // access and refresh token 
    // send cookie

    const { username, email, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    const isValidPassword = await user.isPasswordCorrect(password)

    if (!isValidPassword) {
        throw new ApiError(401, "invalid user password")
    }
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id)
    
    const options = {
        httpOnly: true,
        secure: true,
    }
    
    return res
    .status(200)
    .cookie("accessToken" , accessToken, options)
    .cookie("refreshToken", refreshToken , options)
    .json(
        new ApiResponse(200, 
            {
                user: loggedInUser, accessToken , refreshToken
            },
            "user logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearcookie("accessToken" , options)
    .clearcookie("refreshToken" , options)
    .json(
        new ApiResponse(200, {} , "user logged out")
    )
    
})
    
export { registerUser, loginUser, logoutUser }