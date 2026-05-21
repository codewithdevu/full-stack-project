import fs from "fs";
import { ApiError } from "./ApiError.js";

const deleteOldImage = async (localFilepath) => {
    try {
        if (!localFilepath) return null;

        if (localFilepath && fs.existsSync(localFilepath)) {
            fs.unlinkSync(localFilepath);
        }
        
        return true; 
    } catch (error) {

        throw new ApiError(500, `Failed to delete local file: ${error.message}`);
    }
};

export { deleteOldImage };