import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOncloudinary } from "../utils/cloudinary.js"
import fs from "fs"
import { response } from "express";


const getAllVideos = asyncHandler(async (req, res) => {
    const { psge = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // Todo: get all videos based on query ,sort , pagination
})

const publishVideo = asyncHandler(async (req, res) => {
    // Todo: get Video , upload to cloudinary, create video
    const { title, description } = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "title and descirption is required")
    }

    const videoLocalpath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalpath = req.files?.thumbnail?.[0]?.path

    if (!(videoLocalpath && thumbnailLocalpath)) {
        throw new ApiError(400, "videoFile or thumbnail is reqiured")
    }

    
    const videoFile = await uploadOncloudinary(videoLocalpath)
    const thumbnail = await uploadOncloudinary(thumbnailLocalpath)
    
    if (!(videoFile && thumbnail)) {
        if(videoLocalpath) fs.unlinkSync(videoLocalpath)
        if(thumbnailLocalpath) fs.unlinkSync(thumbnailLocalpath)
        throw new ApiError(400, "videoFile or thumbnail is required")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, video , "video is upload"))
})

const getVideoById = asyncHandler(async (req, res) => {
    //Todo: get Video by id
    const { videoId } = req.params

    const validatedVideoId = mongoose.isValidObjectId(videoId)

    if(!validatedVideoId){
        throw new ApiError(400, "video Id is reqiured")
    }
    
    await Video.findByIdAndUpdate( videoId , { $inc: {views: 1} })

    const video = await Video.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
    ])

    if(!video?.length){
        throw new ApiError(400, "Error: while genreating pipline")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Get the video by id succcessfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    // Todo:  update video details like -> title , descirption , thumbnail
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus

}