import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOncloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// NEW IMPORTS FOR S3 & BULLMQ QUEUE
import { uploadOnS3, deleteHLSFolderFromS3 } from "../utils/s3.js";
import { videoQueue } from "../queues/video.queue.js"; 

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    if (query) {
        pipeline.push({
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
                    }
                ]
            }
        });
    }

    pipeline.push({ $match: { isPublished: true } });

    if (userId) {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    pipeline.push({
        $sort: {
            [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1
        }
    });

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
    });

    pipeline.push({
        $unwind: "$ownerDetails"
    });

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const videoAggregate = Video.aggregate(pipeline);
    const result = await Video.aggregatePaginate(videoAggregate, options);

    if (!result) {
        throw new ApiError(500, "Error: while fetching videos");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, "videos fetched successfullyy"));
});

const publishVideo = asyncHandler(async (req, res) => {
    console.log("--- DEBUG START ---");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("--- DEBUG END ---");
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "title and description is required");
    }

    const videoLocalpath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalpath = req.files?.thumbnail?.[0]?.path;

    if (!(videoLocalpath && thumbnailLocalpath)) {
        throw new ApiError(400, "videoFile or thumbnail is required");
    }

    try {
        const thumbnail = await uploadOncloudinary(thumbnailLocalpath);
        if (!thumbnail) {
            throw new ApiError(400, "failed to upload thumbnail on cloudinary");
        }

        console.log("Uploading original video to S3...");
        const videoFileMimetype = req.files?.videoFile?.[0]?.mimetype || "video/mp4";
        const s3UploadResult = await uploadOnS3(videoLocalpath, videoFileMimetype);

        if (!s3UploadResult) {
            if (thumbnailLocalpath) fs.unlinkSync(thumbnailLocalpath);
            throw new ApiError(500, "failed to upload original video on S3");
        }

        // 🟢 VOICE NOTE LOGIC: Toggle flag routing context extraction
        const isTranscodingEnabled = process.env.ENABLE_TRANSCODING === "true";

        const video = await Video.create({
            title,
            description,
            thumbnail: thumbnail.url,
            owner: req.user?._id,
            status: isTranscodingEnabled ? "pending" : "completed", // Transcoding off hone par seedha active scale runtime mapping               
            videoFile: s3UploadResult.videoUrl, 
            hlsMasterUrl: isTranscodingEnabled ? "" : s3UploadResult.videoUrl, // Transcoding off hone par fallback master URL directly pointing to raw video container
            duration: 0,
            views: 0,
            isPublished: true
        });

        if (isTranscodingEnabled) {
            console.log("🎬 Adding job to video-Transcoding queue pipeline orchestration...");
            await videoQueue.add(
                "transcode-job",
                {
                    videoId: video._id,
                    s3Key: s3UploadResult.key 
                },
                {
                    attempts: 3,
                    backoff: 5000
                }
            );
        } else {
            console.log("⚠️ Transcoding feature deactivated on production cluster. Bypassing BullMQ job distribution safely.");
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200, 
                video, 
                isTranscodingEnabled 
                    ? "Video uploaded successfully. Transcoding started in background." 
                    : "Video uploaded directly. Transcoding bypassed due to host node structural constraints."
            ));

    } catch (error) {
        if (videoLocalpath && fs.existsSync(videoLocalpath)) fs.unlinkSync(videoLocalpath);
        if (thumbnailLocalpath && fs.existsSync(thumbnailLocalpath)) fs.unlinkSync(thumbnailLocalpath);

        throw new ApiError(500, error?.message || "Internal Server Error during video publishing");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id");
    }

    const baseVideoDocument = await Video.findById(videoId).populate("owner", "username fullName avatar");
    
    if (!baseVideoDocument) {
        throw new ApiError(404, "Requested media file stream entity not found in database cluster");
    }

    if (baseVideoDocument.status === "pending" || baseVideoDocument.status === "processing") {
        console.log(`Video ${videoId} is currently processed by internal FFmpeg worker nodes. Delivering baseline payload.`);
        return res
            .status(200)
            .json(new ApiResponse(200, baseVideoDocument, "Video target layer caught in async transcoding pipeline log. Rendering waiting shelf."));
    }

    const userHasWatched = req.user?.watchHistory?.includes(videoId);

    if (!userHasWatched) {
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    }

    const videoAggregationArray = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: { $in: [req.user?._id, "$likes.likedBy"] },
                subscribersCount: { $size: "$subscribers" },
                isSubscribed: {
                    $in: [req.user?._id, "$subscribers.subscriber"]
                }
            }
        },
        { $project: { likes: 0, subscribers: 0 } }
    ]);

    if (!videoAggregationArray?.length) {
        throw new ApiError(404, "Video dataset compilation error");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoAggregationArray[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!videoId) {
        throw new ApiError(400, "video file is reqiured");
    }

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "title and descirption are reqiured");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "videoId is invalid");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to update this video");
    }

    const thumbnailLocalpath = req.file?.path || req.files?.thumbnail?.[0]?.path;

    let thumbnail;
    if (thumbnailLocalpath) {
        try {
            await deleteOnCloudinary(video.thumbnail, "image");
            thumbnail = await uploadOncloudinary(thumbnailLocalpath);

            if (fs.existsSync(thumbnailLocalpath)) {
                fs.unlinkSync(thumbnailLocalpath);
            }

            if (!thumbnail) {
                throw new ApiError(400, "failed to upload file on cloudinary");
            }
        } catch (error) {
            if (fs.existsSync(thumbnailLocalpath)) {
                fs.unlinkSync(thumbnailLocalpath);
            }
            throw new ApiError(400, "failed to upload file on cloudinary");
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
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "video updated succcessfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "invalid video Id ");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "you can't delete the video");
    }

    if (video.thumbnail) {
        await deleteOnCloudinary(video.thumbnail, "image");
    }
    if (video.videoFile && video.videoFile.includes("cloudinary")) {
        await deleteOnCloudinary(video.videoFile, "video");
    }

    console.log(`Cleaning up S3 assets for video ${videoId}...`);
    await deleteHLSFolderFromS3(videoId);

    const result = await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "videoId is reqiured");
    }

    const validId = mongoose.isValidObjectId(videoId);

    if (!validId) {
        throw new ApiError(400, "invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "unauthorized request");
    }

    const newstatus = !video.isPublished;

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
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "updated ispublished video successfullyy"));
});

const searchVideos = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === "") {
        throw new ApiError(400, "Search query text is required");
    }

    const searchRegex = new RegExp(query.trim(), "i");

    const videos = await Video.find({
        $or: [
            { title: { $regex: searchRegex } },
            { description: { $regex: searchRegex } }
        ]
    }).populate("owner", "username fullName avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos searched successfully"));
});

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    searchVideos
};