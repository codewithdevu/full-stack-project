import { spawn } from "child_process";

const runFFmpeg = (inputPath, outputPath, resolution) => {

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn("ffmpeg", [
            "-i",
            inputPath,

            "-vf",
            `scale=-2:${resolution}`,

            "-c:v",
            "libx264",

            "-crf",
            "23",

            "-preset",
            "medium",

            "-c:a",
            "aac",

            "-b:a",
            "128k",

            outputPath
        ]);

        ffmpeg.stderr.on("data", (data) => {
            console.log(data.toString());
        });

        ffmpeg.on("close", (code) => {

            if (code === 0) {
                resolve();
            } else {
                reject(
                    new Error(
                        `FFmpeg exited with code ${code}`
                    )
                );
            }

        });

        ffmpeg.on("error", reject);

    });

};

const transcode1080p = (inputPath, outputPath) =>
    runFFmpeg(inputPath, outputPath, 1080);

const transcode720p = (inputPath, outputPath) =>
    runFFmpeg(inputPath, outputPath, 720);

const transcode480p = (inputPath, outputPath) =>
    runFFmpeg(inputPath, outputPath, 480);

const transcode360p = (inputPath, outputPath) =>
    runFFmpeg(inputPath, outputPath, 360);


export {
    transcode1080p,
    transcode720p,
    transcode480p,
    transcode360p,
};