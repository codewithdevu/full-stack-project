import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOncloudinary, deleteOnCloudinary } from "../utils/cloudinary.js"
import fs from "fs"
import { response } from "express";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // Todo: get all videos based on query ,sort , pagination

    const pipeline = []

    if (query) {
        pipeline.push(
            {
                $match: {
                    $or: [
                        {
                            title: {
                                $regex: query,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: query,
                                $options: "i"
                            }
                        },
                    ]
                },
            }
        )
    }

    pipeline.push({$match: {isPublished: true}})

    if(userId){
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }


    // learn after code is correct
    pipeline.push({
        $sort: {
            [sortBy||"createdAt"]:sortType==="asc"?1:-1
        }
    })

    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        avatar: 1,
                    }
                }
            ]
        }
    })

    pipeline.push({
        $unwind: "$ownerDetails"
    })
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const videoAggregate = Video.aggregate(pipeline)
    const result = await Video.aggregatePaginate(videoAggregate , options)

    if(!result){
        throw new ApiError(500, "Error:  while fetching videos")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , result , "videos fetched successfullyy"))

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
        if (videoLocalpath) fs.unlinkSync(videoLocalpath)
        if (thumbnailLocalpath) fs.unlinkSync(thumbnailLocalpath)
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
        .json(new ApiResponse(200, video, "video is upload"))
})

const getVideoById = asyncHandler(async (req, res) => {
    //Todo: get Video by id
    const { videoId } = req.params

    const validatedVideoId = mongoose.isValidObjectId(videoId)

    if (!validatedVideoId) {
        throw new ApiError(400, "video Id is reqiured")
    }

    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
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

    if (!video?.length) {
        throw new ApiError(400, "Error: while genreating pipline")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "Get the video by id succcessfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    // Todo:  update video details like -> title , descirption , thumbnail
    const { videoId } = req.params
    const { title, description } = req.body

    if (!videoId) {
        throw new ApiError(400, "video file is reqiured")
    }

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "title and descirption are reqiured")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "videoId is invalid")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to update this video")
    }

    const thumbnailLocalpath = req.files?.thumbnail?.[0]?.path

    let thumbnail;
    if (thumbnailLocalpath) {
        await deleteOnCloudinary(video.thumbnail, "image")
        thumbnail = await uploadOncloudinary(thumbnailLocalpath)
        if (!thumbnail) {
            throw new ApiError(400, "failed to upload file on cloudinary")
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail ? thumbnail.url : video.thumbnail,
            }
        },
        {
            new: true,
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "video updated succcessfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "invalid video Id ")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "you can't delete the video")
    }

    await deleteOnCloudinary(video.videoFile, "video")
    await deleteOnCloudinary(video.thumbnail, "image")

    const result = await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, result, "deleted succcessfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "videoId is reqiured")
    }

    const validId = mongoose.isValidObjectId(videoId)

    if (!validId) {
        throw new ApiError(400, "invalid videoId")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "unauthorized request")
    }

    const newstatus = !video.isPublished

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: newstatus
            }
        },
        {
            new: true
        }

    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "updated ispublished video successfullyy"))
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus

}