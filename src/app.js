import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./database/connection.js"; 

const app = express();

// 1. 🟢 BULLETPROOF MULTI-ORIGIN PRODUCTION MATRIX
const allowedOrigins = [
    "https://divyansh-tube.vercel.app",
    "https://divyansh-tube-frontend.vercel.app", // 🚀 Safe Backup: Agar vercel dashboard naming strict ho
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

app.use(cors({
    origin: function (origin, callback) {
        // Postman, mobile apps ya local non-browser hits me origin 'undefined' hota h
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                          origin.startsWith("chrome-extension://") ||
                          origin.includes("vercel.app"); // 🔥 Ultimate Safeguard for all vercel branches

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`CORS Blocked for Origin: ${origin}`);
            callback(new Error("CORS policy blockage across server environments"));
        }
    },
    credentials: true, // 🟢 SUPER CRITICAL: Handshake browser cross-domain cookies storage injection
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

// Pre-flight OPTIONS hit handling
app.options("*", cors());

// ⚠️ PAYLOAD LIMITS FOR FULL VIDEO STREAMS HANDLING
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// 2. 🚀 SERVERLESS DATABASE INSTANCE VALVE MIDDLEWARE:
app.use(async (req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Database Connection Error in App Pipeline",
            details: error.message
        });
    }
});

// Routes Import 
import userRouter from "./routes/user.route.js";
import commentRouter from "./routes/comment.route.js";
import videoRouter from "./routes/video.route.js";
import tweetRouter from "./routes/tweet.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import likeRouter from "./routes/like.route.js";
import playlistRouter from "./routes/playlist.route.js";
import dashboardRouter from "./routes/dashboard.route.js";

// Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export default app;