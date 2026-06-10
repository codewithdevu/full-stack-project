import fs from "fs";
import { spawn } from "child_process";

const generateHLS = (inputPath, outputDir) => {

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true,
        });
    }

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn("ffmpeg", [

            "-i",
            inputPath,

            "-c:v",
            "copy",

            "-c:a",
            "copy",

            "-start_number",
            "0",

            "-hls_time",
            "10",

            "-hls_list_size",
            "0",

            "-f",
            "hls",

            `${outputDir}/index.m3u8`

        ]);

        ffmpeg.stderr.on("data", (data) => {
            console.log(data.toString());
        });

        ffmpeg.on("close", (code) => {

            console.log("HLS Exit Code:", code);

            if (code === 0) {
                resolve();
            } else {
                reject(
                    new Error(`ffmpeg exited with code ${code}`)
                );
            }

        });

        ffmpeg.on("error", reject);

    });

};

export { generateHLS };