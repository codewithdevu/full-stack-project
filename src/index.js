import connectDb from "./database/connection.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
    path: ".env"
})

connectDb()
.then(
    
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`server started at port: http://localhost:${process.env.PORT}`);
        
    }),
    
    app.get("/" , (req , res) => {
        res.send("welocome to homepage")
    }),
)
.catch((err) => {
    console.log("mongo db connect ERROR: " , err);
    
})

