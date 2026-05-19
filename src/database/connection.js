import mongoose from "mongoose";
import { db_name } from "../constants.js";

// Vercel serverless context me global promise hold karne ke liye variable
let cachedConnectionPromise = null;

const connectDb = async () => {
    try {
        // 1. 🟢 CONNECTION CHECK: Agar connected h (readyState 1), toh turant aage badho
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        // 2. 🟢 CONNECTING STATE HANDLER: Agar background me pehle se connection chal raha h (readyState 2),
        // toh naya connection mat banao, balki chal rahe connection ke complete hone ka wait karo
        if (mongoose.connection.readyState === 2 && cachedConnectionPromise) {
            console.log("⏳ Database connection is in progress, awaiting existing promise...");
            return await cachedConnectionPromise;
        }

        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("Database URI string is missing from environment variables.");
        }

        console.log(`📡 Creating new database connection pool for: ${db_name}...`);

        // 3. 🟢 PROMISE CACHING: Connection promise ko cache me save kar rhe h taki race-condition na bane
        cachedConnectionPromise = mongoose.connect(`${mongoUri}/${db_name}`, {
            bufferCommands: false, // Serverless optimization kept active
        });

        const connectionInstance = await cachedConnectionPromise;
        
        console.log(`🚀 MongoDB Connected !! Host: ${connectionInstance.connection.host}`);
        return connectionInstance;
        
    } catch (error) {
        console.error("❌ MongoDB connection FAILED: ", error);
        cachedConnectionPromise = null; // Error aane par cache saaf karein
        throw error; 
    }
}

export default connectDb;