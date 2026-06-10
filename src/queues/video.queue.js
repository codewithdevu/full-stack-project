import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";


const videoQueue = new Queue(
    "video-Transcoding",
    {
        connection: redisConnection,
    }
);

export {videoQueue};