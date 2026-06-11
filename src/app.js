import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./database/connection.js"; 

const app = express();

// 1. 🟢 DYNAMIC CORS LOGIC (Postman aur Local frontend ke liye fallback updated)
const allowedOrigins = [
    "https://divyansh-tube.vercel.app",
    "http://localhost:5173" 
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("chrome-extension://")) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy blockage across server environments"));
        }
    },
    credentials: true, // 🟢 CRITICAL: Cookies support over different cloud networks
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

// ⚠️ INCREASING PAYLOAD LIMITS FROM 20kb TO 100mb FOR VIDEOS HANDLING
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