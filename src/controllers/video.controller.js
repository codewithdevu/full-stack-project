import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { upload } from "../middlewares/multer.middleware";

const getAllVideos = asyncHandler(async(req , res) => {
    const {psge = 1 , limit = 10 , query ,sortBy, sortType , userId} = req.query
    // Todo: get all videos based on query ,sort , pagination
})

const publishVideo = asyncHandler(async(req, res) => {
    const {title , descirption} = req.body
    // Todo: get Video , upload to cloudinary, create video
})

const getVideoById = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    //Todo: get Video by id
})

const updateVideo = asyncHandler(async(req , res) => {
    // Todo:  update video details like -> title , descirption , thumbnail
})

const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params
})

const togglePublishStatus = asyncHandler(async(req , res) => {
    const {videoId} = req.params
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus

}