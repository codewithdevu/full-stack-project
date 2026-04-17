import connectDb from "./database/connection.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
    path: ".env"
})

connectDb()
.then(
    app.listen(process.env.PORT , () => {
        console.log(`server started at port: https://localhost:${process.env.PORT}`);
        
    })
)
.catch((err) => {
    console.log("mongo db connect ERROR: " , err);
    
})

