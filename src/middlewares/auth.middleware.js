// src/middlewares/auth.middleware.js (Backend)

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
     // 🟢 DYNAMIC AUTH DETECTOR: Cookie aur Bearer Header dono se smoothly tokens extract karega
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     
     if (!token) {
         throw new ApiError(401, "Unauthorized request: No access token found in headers or cookies");
     }
     
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
 
     if (!user) {
         throw new ApiError(401, "Invalid access token session context");
     }
 
     req.user = user;
     next();
     
   } catch (error) {
        // ⚡ SILENT HANDSHAKE FIX: Agar token sachi me expired hai, toh static code 401 pass karo 
        // taaki frontend response interceptor automatic refresh trigger pipeline chala sake!
        const statusCode = error.name === "TokenExpiredError" ? 401 : 401;
        throw new ApiError(statusCode, error?.message || "Invalid access token verification flow dropped");
   }
});