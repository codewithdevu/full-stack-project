import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOncloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req , res) =>{
    // get user details from frontend 
    // validation - not empty
    // check if user already exists : username, email 
    // check for images , check for avatar 
    // upload them to couldinary , avatar 
    // create user object- create entry token field from response
    // check for user creation 
    // return response

    const {email, username, fullName , password} = req.body
    console.log("email: ", email);

    if (
        [fullName, email ,username , password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are reqiured")
    }

    if(!email.includes("@"))
    {
        throw new ApiError(400, "@ is reqiured in email")
    }

    const existedUser = await User.findOne({
        $or: [{email} , {username}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username is already exists ")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOncloudinary(avatarLocalPath);
    const coverImage = await uploadOncloudinary(coverImageLocalPath)

    if(!avatar){
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
    new ApiResponse(200, createdUser , "user registered successfully")
)


    
})

export {registerUser}