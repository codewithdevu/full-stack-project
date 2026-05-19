import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connectDb = async () => {
    try {
        // 1. 🟢 CACHED INSTANCE: Agar serverless function pehle se connect h (readyState 1 mtlb connected), 
        // toh dubara connection open mat karo, purana instance reuse karo.
        if (mongoose.connection.readyState >= 1) {
            console.log("MongoDB already connected (Cached Instance)");
            return;
        }

        // 2. 🟢 ENVIRONMENT VARIABLE VALIDATION FALLBACK: 
        // Agar Vercel par MONGO_URI ya MONGODB_URI dono me se koi bhi save hoga, ye use automatic pick kar lega.
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!mongoUri) {
            console.error("❌ ERROR: Neither MONGO_URI nor MONGODB_URI is defined in environment variables.");
            throw new Error("Database URI string is missing from the server configuration.");
        }

        console.log(`Connecting to database: ${db_name}...`);

        // 3. 🟢 SERVERLESS SAFE CONNECTION:
        // bufferCommands: false lagaya h taaki delay hone par requests serverless queue me lambi na phasein
        const connectionInstance = await mongoose.connect(`${mongoUri}/${db_name}`, {
            bufferCommands: false, 
        });

        console.log(`🚀 MongoDB Connected Successfully !! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("❌ MongoDB connection FAILED Error: ", error);
        // 4. Serverless context me process.exit(1) call karne se container break ho jata h, 
        // isliye error throw karna hi professional standard h.
        throw error; 
    }
}

export default connectDb;