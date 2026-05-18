import dotenv from "dotenv";
import path from "path";
import connectDb from "./database/connection.js";
import app from "./app.js"; // Curly braces hata diye kyunki app.js me export default hai

dotenv.config({
    path: "./.env"
});

// Serverless DB Connection Middleware
let isConnected = false;
app.use(async (req, res, next) => {
    if (isConnected) return next();
    try {
        await connectDb();
        isConnected = true;
        next();
    } catch (err) {
        console.log("mongo db connect ERROR: ", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// Local testing ke liye (Vercel is block ko ignore karega)
if (process.env.NODE_ENV !== 'production') {
    connectDb().then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server started at port: http://localhost:${process.env.PORT || 8000}`);
        });
    }).catch((err) => console.log(err));
}

export default app;