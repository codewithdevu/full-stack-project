import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.aggregate([
        {
            $match: {}
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $addFields: {
                likesCount: { $size: "$likesDetails" }, 
                isLiked: {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(req.user?._id), "$likesDetails.likedBy"] },
                        then: true,
                        else: false
                    }
                },
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    fullName: "$ownerDetails.fullName",
                    avatar: "$ownerDetails.avatar"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                likesDetails: 0,
                ownerDetails: 0
            }
        }
    ]);

    if (!tweets) {
        throw new ApiError(404, "No tweets found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const createTweet = asyncHandler(async (req, res) => {
    // Todo: create Tweet 
    const { content } = req.body

    if (!content) {
        throw new ApiError(404, "content is required")
    }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content: content
    })

    if (!tweet) {
        throw new ApiError(404, "there is no tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // Todo: get User tweet 
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
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
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    if (!tweets) {
        throw new ApiError(404, "No tweets found for this user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    // Todo: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "content is reqiured")
    }
    if (!tweetId) {
        throw new ApiError(400, "tweetId is reqiured")
    }

    const valid = mongoose.isValidObjectId(tweetId)

    if (!valid) {
        throw new ApiError(400, "invalid tweet id")
    }

    const confirmedTweetId = await Tweet.findById(tweetId)

    if (!confirmedTweetId) {
        throw new ApiError(404, "tweet not found")
    }

    if (confirmedTweetId?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "UnAunthorized request")
    }


    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    // Todo: delete tweet

    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(404, "tweetId is reqiured")
    }

    const valid = mongoose.isValidObjectId(tweetId)

    if (!valid) {
        throw new ApiError(400, "invalid tweet id")
    }

    const confirmedTweetId = await Tweet.findById(tweetId)


    if (!confirmedTweetId) {
        throw new ApiError(404, "tweet not found")
    }

    if (confirmedTweetId?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "UnAunthorized request")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "delete tweet succcessfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}