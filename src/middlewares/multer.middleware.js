import multer from "multer";

// 🟢 MOVEMENT TO BULLETPROOF MEMORY STORAGE
// Bypasses local server disk systems completely to secure against permission bugs on cloud nodes.
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { 
        fileSize: 100 * 1024 * 1024 // 🔒 Strict allocation lock at 100MB
    }
});