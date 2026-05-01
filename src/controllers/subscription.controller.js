import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js"
import { ApiResponse } from "../utils/ApiResponse";

const toggleSubscription = asyncHandler(async (req, res) => {
    // Todo: toggle subscription
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(404, "channelId is reqiured")
    }

    const subscribedUser = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if (subscribedUser) {
        await Subscription.deleteOne({
            subscriber: req.user?._id,
            channel: channelId,
        })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "unsubscribed succcessfully"))
    } else {
        await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "subscribed succcessfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const getUserChannelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                            username: 1,
                        }
                    }
                ]
            }
        },
        { $unwind: "$subscriber" }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, getUserChannelSubscribers, "subscriber fetched successfully"))
})

//controller to return channel list to which user has subscriber
const getSubscirbedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const getSubscirbedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedDetails",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                            username: 1,
                        }
                    }
                ]
            }
        },
        { $unwind: "$subscribedDetails" }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, getSubscirbedChannels, "following fetched successfully"))

})

export {
    toggleSubscription,
    getSubscirbedChannels,
    getUserChannelSubscribers
}