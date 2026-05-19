import mongoose from "mongoose";
import { db_name } from "../constants.js";

let cachedConnectionPromise = null;

const connectDb = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        if (mongoose.connection.readyState === 2 && cachedConnectionPromise) {
            console.log("⏳ Database connection is in progress, awaiting existing promise...");
            return await cachedConnectionPromise;
        }

        let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("Database URI string is missing from environment variables.");
        }

        // 🟢 THE FIX: Check karo ki string ke end me pehle se database name h ya nahi
        // Agar URI ke end me fullstack likha h, toh alag se name append mat karo!
        let finalConnectionUri = mongoUri;
        
        if (!mongoUri.includes(`/${db_name}`)) {
            // Agar string ke end me slash nahi h, toh use clean connect karo
            finalConnectionUri = mongoUri.endsWith("/") 
                ? `${mongoUri}${db_name}` 
                : `${mongoUri}/${db_name}`;
        }

        console.log(`📡 Initializing secure connection instance...`);

        cachedConnectionPromise = mongoose.connect(finalConnectionUri, {
            bufferCommands: false, 
        });

        const connectionInstance = await cachedConnectionPromise;
        
        console.log(`🚀 MongoDB Connected !! Host: ${connectionInstance.connection.host}`);
        return connectionInstance;
        
    } catch (error) {
        console.error("❌ MongoDB connection FAILED: ", error);
        cachedConnectionPromise = null; 
        throw error; 
    }
}

export default connectDb;