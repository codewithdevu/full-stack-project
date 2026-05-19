import dotenv from "dotenv";
import path from "path";
import connectDb from "./database/connection.js";
import app from "./app.js";

// 1. Safely load env configurations (Dono platform par strict path integration ke sath)
dotenv.config({
    path: path.resolve(process.cwd(), ".env")
});

const PORT = process.env.PORT || 8000;

// 2. Cross-Platform Database Initializer Logic
const startServer = async () => {
    try {
        // Database connect karo (Hamari nayi connection file ready hai cached instance ke sath)
        await connectDb();

        // 3. LOCAL DEVELOPMENT HANDLER:
        // Agar local context h ya Vercel environment nahi h, tabhi app.listen chalega
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`🚀 Server running smoothly on Localhost: http://localhost:${PORT}`);
            });
        } else {
            console.log("⚡ Serverless Cloud Context Initialized Successfully.");
        }
    } catch (err) {
        console.error("❌ Critical System Boot FAILED:", err);
        // Local par failure hone par system crash karein, vercel par function handle karega
        if (!process.env.VERCEL) process.exit(1);
    }
};

// Immediate Execution Trigger
startServer();

// Vercel Serverless requirements ke liye default app instances export
export default app;