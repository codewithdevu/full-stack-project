import {asynchandler} from "../utils/asynchandler.js"


const registerUser = asynchandler(async (req , res) =>{
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
    
})

export {registerUser}