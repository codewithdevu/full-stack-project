import dotenv from "dotenv";
import path from "path";
import connectDb from "./database/connection.js";
import app from "./app.js";

// 1. Load env configurations
dotenv.config({
    path: path.resolve(process.cwd(), ".env")
});

const PORT = process.env.PORT || 8000;

// 2. Cross-Platform Database Initializer Logic
const startServer = async () => {
    try {
        await connectDb();

        // 🟢 UNIVERSAL PLATFORM HANDLER (Vercel vs Render vs Local)
        if (process.env.VERCEL) {
            // Pure Serverless Context (Vercel ke liye - No app.listen needed)
            console.log("⚡ Serverless Cloud Context Initialized Successfully.");
        } else {
            // Persistent Live Context (Render Cloud aur Localhost Dono Ke Liye compulsory h)
            app.listen(PORT, () => {
                console.log(`🚀 Server running smoothly on Port: ${PORT}`);
            });
        }
    } catch (err) {
        console.error("❌ Critical System Boot FAILED:", err);
        if (!process.env.VERCEL) process.exit(1);
    }
};

// Immediate Execution Trigger
startServer();

export default app;