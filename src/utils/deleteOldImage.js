import fs from "fs";
import { ApiError } from "./ApiError.js";

const deleteOldImage = async (localFilepath) => {
    try {
        if (!localFilepath) return null;

        // Check if file exists before attempting to delete
        if (localFilepath && fs.existsSync(localFilepath)) {
            fs.unlinkSync(localFilepath);
        }
        
        return true; // Return a success indicator
    } catch (error) {
        // 500 is more appropriate for server-side file system failures than 401
        throw new ApiError(500, `Failed to delete local file: ${error.message}`);
    }
};

export { deleteOldImage };