import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import streamifier from "streamifier"; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

/**
 * 🟢 DACTIVE BACKWARD COMPATIBLE CLEANUP
 * Public ID nikal kar Cloudinary se assets wipe out karne ke liye
 */
const deleteOnCloudinary = async (url, resource_type = "image") => {
  try {
    if (!url) return null;
    
    const fileName = url.split("/").pop();
    const publicId = fileName.split(".")[0];

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource_type
    });
    return response;
  } catch (error) {
    console.error("❌ Cloudinary deletion FAILED error:", error);
    return null;
  }
};

/**
 * 🔥 INTELLIGENT MASTER UPLOADER (ULTIMATE FIX)
 * Ye single function khud check karega ki dynamic data path string hai ya raw memory buffer,
 * aur dono controller flows (Register, Video Upload, Settings Update) ko bina tode bypass karega!
 */
const uploadOncloudinary = async (fileInput, resourceType = "auto") => {
  try {
    if (!fileInput) return null;

    // 🎬 CASE A: IF THE INPUT IS A RAW MEMORY BUFFER (From Settings/Multer Memory Storage)
    if (Buffer.isBuffer(fileInput)) {
      console.log("⚡ Cloudinary Engine: RAM buffer stream detected. Piping binary data...");
      
      return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
          { 
            resource_type: resourceType, 
            folder: "velocity_stream" 
          },
          (error, result) => {
            if (result) resolve(result);
            else {
              console.error("❌ Cloudinary Memory Buffer Stream upload FAILED:", error);
              resolve(null); // Return null instead of crashing the thread
            }
          }
        );
        
        // Push raw binary stream chunks straight into Cloudinary gate
        streamifier.createReadStream(fileInput).pipe(cld_upload_stream);
      });
    }

    // 🎬 CASE B: IF THE INPUT IS A LOCAL FILE PATH STRING (From Disk Storage Fallbacks)
    console.log(`⚡ Cloudinary Engine: Local filepath string detected -> ${fileInput}`);
    const response = await cloudinary.uploader.upload(fileInput, {
      resource_type: "auto",
      folder: "velocity_stream"
    });

    // Safe Cleanup for local temp folder
    if (fs.existsSync(fileInput)) {
      fs.unlinkSync(fileInput);
    }

    return response;

  } catch (error) {
    console.error("❌ Cloudinary upload FAILED loop trigger:", error);
    // Fallback disk cleanup if string path breaks
    if (typeof fileInput === "string" && fs.existsSync(fileInput)) {
      fs.unlinkSync(fileInput);
    }
    return null;
  }
};

// Original separate function configuration context preserved for your video controllers
const uploadBufferOnCloudinary = (fileBuffer, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream(
      { 
        resource_type: resourceType, 
        folder: "mytube_thumbnails" 
      },
      (error, result) => {
        if (result) resolve(result);
        else {
          console.error("❌ Cloudinary Memory Buffer Stream upload FAILED:", error);
          reject(error);
        }
      }
    );
    
    streamifier.createReadStream(fileBuffer).pipe(cld_upload_stream);
  });
};

export { 
  uploadOncloudinary, 
  uploadBufferOnCloudinary, 
  deleteOnCloudinary 
};