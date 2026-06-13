import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import streamifier from "streamifier"; // 🟢 Buffer integration stream bridge active

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});


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


const uploadOncloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) return null;

    // 1. Target asset upload pipeline on Cloudinary servers
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto"
    });

    // 2. 🟢 SAFE CLEANUP BLOCK: File successfully upload hone ke baad physical verification
    if (fs.existsSync(localFilepath)) {
      fs.unlinkSync(localFilepath);
    }

    return response;

  } catch (error) {
    console.error("❌ Cloudinary upload FAILED loop trigger:", error);

    // 3. 🟢 FALLBACK CLEANUP: Agar operations break ho jayein, toh bhi kachra saaf karna zaroori h
    if (fs.existsSync(localFilepath)) {
      fs.unlinkSync(localFilepath);
    }
    return null;
  }
};

// 🔥 NEW PRODUCTION REFACTOR: Direct injection for processing raw RAM buffers
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
    
    // Convert raw binary buffer stream directly into streaming nodes to pipe onto Cloudinary gateway
    streamifier.createReadStream(fileBuffer).pipe(cld_upload_stream);
  });
};

// 🟢 EXPORT ALL ARCHITECTURAL PATTERNS Safely
export { 
  uploadOncloudinary, 
  uploadBufferOnCloudinary, // 👈 Now exported properly for video.controller.js!
  deleteOnCloudinary 
};