import dotenv from "dotenv";
dotenv.config();

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// 🟢 FIX: Refactored utility to ingest the raw file memory object directly from RAM
const uploadOnS3 = async (fileObject) => {
    try {
        if (!fileObject || !fileObject.buffer) {
            console.error("❌ S3 Buffer Payload Check Failed: fileObject or buffer is empty.");
            return null;
        }

        console.log("⚙️ Processing file allocation memory buffer...");

        // Unique filename configuration blueprint
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const fileExt = path.extname(fileObject.originalname) || ".mp4";
        const baseName = path.basename(fileObject.originalname, fileExt).replace(/\s+/g, "_");

        const filename = `${baseName}-${uniqueSuffix}${fileExt}`;
        const key = `videos/${filename}`;

        console.log(`Creating S3 PutObjectCommand pipeline container for key: ${key}`);

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: fileObject.buffer, // 🔥 CRITICAL REFACTOR: Direct injection of binary buffers (Bypasses Local Disks completely)
            ContentType: fileObject.mimetype || "video/mp4",
        });

        console.log("🚀 Discharging binary stream payload to S3 cloud storage...");
        await s3Client.send(command);
        console.log("✨ S3 Upload Node Sequence: SUCCESS");

        const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return {
            videoUrl,
            key,
        };
    } catch (error) {
        console.error("❌ S3 Upload Critical Structural Error:", error);
        return null;
    }
}

const downloadFromS3 = async (s3Key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
    });

    const response = await s3Client.send(command);

    const tempDir = path.join(
        process.cwd(),
        "uploads",
        "temp"
    );

    // Folder create kar do agar exist nahi karta
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(
        tempDir,
        "input.mp4"
    );

    const writeStream = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
        response.Body.pipe(writeStream);

        response.Body.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);
    });

    return filePath;
};

const uploadFinalTransocodeFileToS3 = async (filePath) => {
    console.log("Reading processed file...");
    const fileContent = fs.readFileSync(filePath);

    const fileName = path.basename(filePath);

    const key = `processed/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: "video/mp4",
    });
    console.log("Sending file to S3...");
    await s3Client.send(command);
    console.log("S3 upload success");

    const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
        videoUrl,
        key,
    };
};

const uploadHLSFolderToS3 = async (localFolderPath, videoId) => {
    const uploadedFiles = [];
    
    const uploadRecursion = async (currentPath) => {
        const files = fs.readdirSync(currentPath);

        for (const file of files) {
            const fullPath = path.join(currentPath, file);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                await uploadRecursion(fullPath);
            } else {
                const relativePath = path.relative(localFolderPath, fullPath);  

                const s3Key = `hls/${videoId}/${relativePath.replace(/\\/g, "/")}`;

                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: s3Key, 
                    Body: fs.createReadStream(fullPath),
                });

                await s3Client.send(command);

                uploadedFiles.push({
                    key: s3Key,
                });

                console.log(`Uploaded ${s3Key} to S3`);
            }
        }
    };

    await uploadRecursion(localFolderPath);
    return uploadedFiles;
};

const deleteHLSFolderFromS3 = async (videoId) => {
    try {
        const prefix = `hls/${videoId}/`;
        
        // 1. Pehle us folder ke andar ki saari files list karo
        const listCommand = new ListObjectsV2Command({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: prefix,
        });
        
        const listResponse = await s3Client.send(listCommand);
        
        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            console.log("No files found on S3 for this video ID");
            return;
        }

        // 2. Saari files ke keys ka array banao
        const objectsToDelete = listResponse.Contents.map((item) => ({
            Key: item.Key,
        }));

        // 3. Ek baar me saari files delete mado
        const deleteCommand = new DeleteObjectsCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: { Objects: objectsToDelete },
        });

        await s3Client.send(deleteCommand);
        console.log(`Successfully deleted HLS folder for video: ${videoId} from S3`);
    } catch (error) {
        console.error("S3 HLS Folder Deletion Error:", error);
    }
};

export {
    s3Client,
    uploadOnS3,
    downloadFromS3,
    uploadFinalTransocodeFileToS3,
    uploadHLSFolderToS3,
    deleteHLSFolderFromS3,
};