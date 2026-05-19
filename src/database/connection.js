import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connectDb = async () => {
    try {
        // 1. Agar pehle se connect h (readyState 1 mtlb connected), toh dubara connect mat karo
        if (mongoose.connection.readyState >= 1) {
            console.log("MongoDB already connected (Cached Instance)");
            return;
        }

        console.log(`Connecting to database: ${db_name}...`);

        // 2. URI ke end mein database ka naam zaroori h, aur serverless settings add ki h
        const connectioninstance = await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`, {
            bufferCommands: false, // Connection microsecond delay hone par requests ko freeze hone se rokega
        });

        console.log(`mongoDb connected !! DB host: ${connectioninstance.connection.host}`);
        
    } catch (error) {
        console.log("mongoDb connection ERROR: ", error);
        // 3. Serverless par process.exit(1) nahi chalate, error throw karte h taaki middleware handle kare
        throw error; 
    }
}

export default connectDb;