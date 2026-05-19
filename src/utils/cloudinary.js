import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary Credentials Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

/**
 * 🟢 DELETE ON CLOUDINARY
 * Utility function to remove asset from cloud when updated/deleted
 */
const deleteOnCloudinary = async (url, resource_type = "image") => {
  try {
    if (!url) return null;
    
    // Extract Public ID safely from the asset URL
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
 * 🟢 UPLOAD ON CLOUDINARY (SERVERLESS ADAPTIVE)
 * Safe temporary file upload handling for Localhost and Vercel /tmp directory
 */
const uploadOncloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) return null;

    // 1. Target asset upload pipeline on Cloudinary servers
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto"
    });

    // 2. 🟢 SAFE CLEANUP BLOCK: File successfully upload hone ke baad physical verification
    // check karega ki file temporary path par h ya nahi, tabhi delete marega.
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

export { uploadOncloudinary, deleteOnCloudinary };