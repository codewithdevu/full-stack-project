import multer from "multer";
import fs from "fs";
import path from "path";

// 1. 🟢 ENVIROMENT ADAPTIVE STORAGE LOGIC:
const isVercel = process.env.VERCEL === "true" || !!process.env.VERCEL;
const tempDir = isVercel ? "/tmp" : "./public/temp";

if (!isVercel && !fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const fileExt = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExt).replace(/\s+/g, "_");
        
        cb(null, `${baseName}-${uniqueSuffix}${fileExt}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }
});