import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStatus = asyncHandler(async (req, res) => {
    // Todo: get the channel stats like total video views , total subscribers , total videos, total likes etc .

    const userId = req.user?._id

    const [totalSubscribers, videoAggregate, likeAggregate] = await Promise.all([

    Subscription.countDocuments({
        channel: userId
    }),

    Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {$sum: 1},
                totalViews: {$sum: "$views"}
            }
        }
    ]),

    Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo"
            }
        },
        {
            $unwind: "$videoInfo"
        },
        {
            $match: {
                "videoInfo.owner": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: 1 }
            }
        }
    ])
])

const stats = {
        subscribers: totalSubscribers || 0,
        totalVideos: videoAggregate[0]?.totalVideos || 0,
        totalViews: videoAggregate[0]?.totalViews || 0,
        totalLikes: likeAggregate[0]?.totalLikes || 0
};

return res
    .status(200)
    .json(new ApiResponse(200, stats, "channel stats of user dashboard successfully"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Todo: get all the videos uploaded by the channnel
    const userId = req.user?._id

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
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
            $addFields: {
                likesCount: {$size: "$likes"},
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200 , videos , "fetched all channel videos succcessfully"))
})

export {
    getChannelStatus,
    getChannelVideos
}