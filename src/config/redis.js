import IORedis from "ioredis";

const redisConnection = new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    // 🟢 PASSING ENCRYPTED CLOUD KEY PAIR
    // Agar cloud environment me password hoga toh fetch karega, local binary container bina password check bypass kar dega
    password: process.env.REDIS_PASSWORD || undefined, 
    maxRetriesPerRequest: null,
});

redisConnection.on("connect" , () => {
    console.log("⚡ [Redis Cluster]: Connection Established Successfully over Hostname Parameters !!");    
});

redisConnection.on("error" , (err) => {
    console.error("❌ [Redis Error]: Node handshake broken ->", err.message);
});

export { redisConnection };