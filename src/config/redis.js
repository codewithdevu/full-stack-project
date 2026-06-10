import IORedis from "ioredis";

const redisConnection = new IORedis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    maxRetriesPerRequest: null,
});

redisConnection.on("connect" , () => {
    console.log("redis Connected !!");    
});

redisConnection.on("error" , (err) => {
    console.log(err);
});

export {redisConnection};