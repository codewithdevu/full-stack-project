import mongoose, { Aggregate } from "mongoose";
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    // Todo: toggle like on video
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(404, "videoId is reqiured")
    }

    const validId = mongoose.isValidObjectId(videoId)

    if (!validId) {
        throw new ApiError(400, "authorized request of video")
    }

    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if (alreadyLiked) {
        await Like.deleteOne({
            video: videoId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "unliked succcessfully"))
    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "liked succcessfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    // Todo: toggle like on comment 
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(404, "commentId is reqiured")
    }

    const validId = mongoose.isValidObjectId(commentId)

    if (!validId) {
        throw new ApiError(400, "invalid commentId")
    }

    const alreadyLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    })

    if (alreadyLiked) {
        await Like.deleteOne({
            comment: commentId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "unLiked the comment succcessfully"))
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "liked the comment succcessfully"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    // Todo: toggle like on tweets
    const { tweetId } = req.params


    if (!tweetId) {
        throw new ApiError(404, "tweetId is reqiured")
    }

    const validId = mongoose.isValidObjectId(tweetId)

    if (!validId) {
        throw new ApiError(400, "invalid tweetId")
    }

    const alreadyLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    })

    if (alreadyLiked) {
        await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "unLiked the tweet succcessfully"))
    }
    else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "liked the tweet succcessfully"))
    }

})

const getLikeVideos = asyncHandler(async (req, res) => {
    // Todo:  get all liked videos

    const getLikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails"
                        }
                    },
                    {$unwind: "$ownerDetails"}
                ]
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $sort: {createdAt: -1}
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, getLikeVideos, "like video fetched succcessfully"))
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikeVideos,
}