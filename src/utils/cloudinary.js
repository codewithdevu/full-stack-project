import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});


const deleteOnCloudinary = async (url , resource_type = "image") => {
  try {
    if (!url) return null;
    
    const fileName = url.split("/").pop();
    const publicId = fileName.split(".")[0];

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource_type
    })
    return response;
  } catch (error) {
    console.log("Error: while deleting form cloudinar", error);
    return null;
  }
}


const uploadOncloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto"
    });
    //file has been uploaded successfull
    // console.log("file is uploaded on cloudinary" , response.url);
    fs.unlinkSync(localFilepath)
    // console.log(response);

    return response;

  } catch (error) {
    fs.unlinkSync(localFilepath) // remove the locally saved temporary file as the upload operation got failed
    return null;

  }

}

export { uploadOncloudinary , deleteOnCloudinary};