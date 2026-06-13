import dotenv from "dotenv";
import path from "path";
import connectDb from "./database/connection.js";
import app from "./app.js";

// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), ".env")
});

const PORT = process.env.PORT || 3000;

// Directly Start Persistent Render/Local Server
const startServer = async () => {
    try {
        await connectDb();
        
        // 🟢 Pure Persistent Listener (No more Vercel serverless confusion!)
        app.listen(PORT, () => {
            console.log(`🚀 Server running smoothly on Port: ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Critical System Boot FAILED:", err);
        process.exit(1);
    }
};

startServer();

export default app;