import connectDb from "./database/connection";
import { configDotenv } from "dotenv";

configDotenv({
    path: "./env"
});

connectDb()

