import mongoose from "mongoose";
import { db_name } from "../constants";

const connectDb = async () => {
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGO_URL}/${db_name}`)
        console.log(`mongoDb connected !! DB host: ${connectioninstance.Connection.host}`);
        
    } catch (error) {
        console.log("mongoDb connection ERROR: ", error)
        process.exit(1)
    }
}

export default connectDb ;
