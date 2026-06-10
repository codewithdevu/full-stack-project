import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { downloadFromS3 } from "../utils/s3.js";
import { transcode720p, transcode1080p, transcode480p, transcode360p } from "../utils/transcode.js"
import { uploadFinalTransocodeFileToS3, uploadHLSFolderToS3 } from "../utils/s3.js";
import { Video } from "../models/video.model.js";
import connectDB from "../database/connection.js";
import fs from "fs"
import { generateHLS } from "../utils/hls.js";
import { createMasterPlaylist } from "../utils/masterPlaylist.js";
import { exec } from "child_process"; // 🟢 Added for duration checking

await connectDB();

[
    "uploads/temp",
    "uploads/output",
    "uploads/hls"
].forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true,
        });
    }
});

// 🟢 Helper function to extract video duration using ffprobe
const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        exec(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(parseFloat(stdout.trim()) || 0);
                }
            }
        );
    });
};

const worker = new Worker(
    "video-Transcoding",

    async (job) => {

        let localVideoPath;
        let output1080;
        let output720;
        let output480;
        let output360;
        let videoDuration = 0; // 🟢 Duration storage variable

        try {

            const video = await Video.findById(job.data.videoId);

            if (!video) {
                throw new Error("Video not found");
            }

            await Video.findByIdAndUpdate(
                job.data.videoId,
                {
                    status: "processing",
                }
            );

            console.log("Downloading Video from S3...");
            localVideoPath = await downloadFromS3(job.data.s3Key);

            // 🟢 Calculate video duration right after downloading
            try {
                console.log("Extracting video duration...");
                videoDuration = await getVideoDuration(localVideoPath);
                console.log(`Video Duration extracted: ${videoDuration} seconds`);
            } catch (durationError) {
                console.error("Failed to extract duration, defaulting to 0:", durationError.message);
            }

            output1080 = `uploads/output/${job.data.videoId}_1080p.mp4`;
            const hls1080Dir = `uploads/hls/${job.data.videoId}/1080p`;

            output720 = `uploads/output/${job.data.videoId}_720p.mp4`;
            const hls720Dir = `uploads/hls/${job.data.videoId}/720p`;

            output480 = `uploads/output/${job.data.videoId}_480p.mp4`;
            const hls480Dir = `uploads/hls/${job.data.videoId}/480p`;

            output360 = `uploads/output/${job.data.videoId}_360p.mp4`;
            const hls360Dir = `uploads/hls/${job.data.videoId}/360p`;

            console.log("Generating 1080p...");
            await transcode1080p(localVideoPath, output1080);

            console.log("Generating 720p...");
            await transcode720p(localVideoPath, output720);

            console.log("Generating 480p...");
            await transcode480p(localVideoPath, output480);

            console.log("Generating 360p...");
            await transcode360p(localVideoPath, output360);

            console.log("All Resolutions Generated");

            console.log("Generating HLS 1080p...");
            await generateHLS(output1080, hls1080Dir);

            console.log("Generating HLS 720p...");
            await generateHLS(output720, hls720Dir);

            console.log("Generating HLS 480p...");
            await generateHLS(output480, hls480Dir);

            console.log("Generating HLS 360p...");
            await generateHLS(output360, hls360Dir);

            console.log("ALL FILE Generated TO HLS");

            const masterPlaylistPath = createMasterPlaylist(job.data.videoId);

            console.log("Master Playlist Created");
            console.log("Master Playlist Path:", masterPlaylistPath);

            const hlsRootFolder = `uploads/hls/${job.data.videoId}`;

            console.log("Uploading HLS folder...");
            await uploadHLSFolderToS3(hlsRootFolder, job.data.videoId);

            const hlsMasterUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/hls/${job.data.videoId}/master.m3u8`;

            console.log("HLS Folder Uploaded To S3");
            console.log("Master URL:", hlsMasterUrl);

            // 🟢 MODIFIED: Status processed karne ke sath duration bhi save kar rahe hain
            await Video.findByIdAndUpdate(
                job.data.videoId,
                {
                    status: "processed",
                    hlsMasterUrl,
                    duration: videoDuration // Saving dynamic duration here
                }
            );

            console.log("MongoDB Updated Successfully with HLS URL and Duration.");

        } catch (error) {

            await Video.findByIdAndUpdate(
                job.data.videoId,
                {
                    status: "failed",
                    error: error.message,
                }
            );

            throw error;

        } finally {

            [
                localVideoPath,
                output1080,
                output720,
                output480,
                output360,
            ].forEach(file => {
                if (file && fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });

            const hlsRootFolder = `uploads/hls/${job.data.videoId}`;

            if (fs.existsSync(hlsRootFolder)) {
                fs.rmSync(
                    hlsRootFolder,
                    {
                        recursive: true,
                        force: true,
                    }
                );
            }

            console.log("Local files cleaned up");
        }

    },

    {
        connection: redisConnection,
    }
);

worker.on("completed", (job) => {
    console.log(`job: ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.log(`job: ${job?.id} failed`);
    console.log(err);
});

console.log("worker started");