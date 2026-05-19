import multer from "multer";
import fs from "fs";
import path from "path";

// 1. 🟢 ENVIROMENT ADAPTIVE STORAGE LOGIC:
// Agar Vercel cloud environment h (process.env.VERCEL), toh system temporary folder '/tmp' use hoga
// Varna localhost par tumhara favorite './public/temp' folder chalaenge!
const isVercel = process.env.VERCEL === "true" || !!process.env.VERCEL;
const tempDir = isVercel ? "/tmp" : "./public/temp";

// 2. SAFETY VALVE: Agar local mashin par folder delete ho gaya ho ya missing ho, toh auto-create kar do
if (!isVercel && !fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Bina kisi path buffer error ke directory variable pass kiya h
        cb(null, tempDir);
    },

    filename: function (req, file, cb) {
        // File compression conflict safety ke liye timestamp append kar diya h
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const fileExt = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExt).replace(/\s+/g, "_");
        
        cb(null, `${baseName}-${uniqueSuffix}${fileExt}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB file sizing safety limits
});