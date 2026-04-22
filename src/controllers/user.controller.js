import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"


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
})

export {registerUser}