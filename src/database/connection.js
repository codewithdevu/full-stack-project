import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connectDb = async () => {
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`mongoDb connected !! DB host: ${connectioninstance.connection.host}`);
        
    } catch (error) {
        console.log("mongoDb connection ERROR: ", error)
        process.exit(1)
    }
}

export default connectDb ;
 