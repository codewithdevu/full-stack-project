import dotenv from "dotenv";
import path from "path";
import connectDb from "./database/connection.js";
import app from "./app.js";

// Sirf local development ke liye .env config load karein
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: path.resolve(process.cwd(), ".env") // Foolproof path resolution
    });
}

// Serverless DB Connection Pool Control
let isConnected = false;

app.use(async (req, res, next) => {
    // Agar pehle se connect h toh seedha aage badhein
    if (isConnected) {
        return next();
    }
    
    try {
        console.log("🔄 Initializing serverless database connection...");
        await connectDb();
        isConnected = true;
        console.log("✅ Database connected successfully in serverless context.");
        next();
    } catch (err) {
        console.log("❌ MongoDB serverless connect ERROR: ", err);
        return res.status(500).json({ 
            error: "Database connection failed", 
            details: err.message 
        });
    }
});

// Local testing handler (Vercel automatic is block ko bypass karega)
if (process.env.NODE_ENV !== 'production') {
    connectDb()
        .then(() => {
            const PORT = process.env.PORT || 8000;
            app.listen(PORT, () => {
                console.log(`🚀 Server started locally at: http://localhost:${PORT}`);
            });
        })
        .catch((err) => {
            console.log("❌ Local DB Connection Failed:", err);
        });
}

// Vercel ke liye application instance export
export default app;