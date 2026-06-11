import IORedis from "ioredis";

// 🟢 BULLETPROOF PRODUCTION-READY SINGLE CONNECTION STRING:
// Agar cloud par REDIS_URL environment variable milega toh direct use karega, 
// nahi toh local dashboard testing ke liye fallback target local container (127.0.0.1) pakdega!
const REDIS_URI = process.env.REDIS_URL || "redis://127.0.0.1:6379";

console.log("Initializing unified bullmq shared cloud cluster nodes...");

const redisConnection = new IORedis(REDIS_URI, {
    maxRetriesPerRequest: null, // 🔥 Mandatory rule configuration tag for BullMQ
});

redisConnection.on("connect" , () => {
    console.log("⚡ [Redis Engine]: Shared Cloud Cache Cluster Connected Successfully !!");    
});

redisConnection.on("error" , (err) => {
    console.error("❌ [Redis Error]: Cluster connection handshake broken ->", err.message);
});

export { redisConnection };
export default redisConnection;