import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: "./.env"
});

import connectDb from "./database/connection.js";
import { app } from "./app.js";


connectDb()
.then(()=> {
        app.listen(process.env.PORT || 8000 , () => {
        console.log(`server started at port: http://localhost:${process.env.PORT}`);
        
    });
    
    app.get("/" , (req , res) => {
        res.send("welocome to homepage")
    });
})
.catch((err) => {
    console.log("mongo db connect ERROR: " , err);
    
})

