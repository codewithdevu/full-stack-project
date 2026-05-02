import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


const getVideoComments = asyncHandler(async (req, res) => {
    // Todo: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const videoIdIsValid = mongoose.isValidObjectId(videoId)

    if (!videoIdIsValid) {
        throw new ApiError(400, "videoId is required")
    }

    const convertId = new mongoose.Types.ObjectId(videoId)

    const skipValue = (page - 1) * limit

    const myPipline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(convertId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
    ]


    const options = { page: parseInt(page), limit: parseInt(limit) }

    const result = await Comment.aggregatePaginate(myPipline, options)

    return res
        .status(200)
        .json(new ApiResponse(200, result, "get video comments successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    //Todo: get a comment to a video
    const { content } = req.body

    if (!content) { throw new ApiError(400, "Content is required") }

    const user = req.user

    const { videoId } = req.params
    const videoIdIsValid = mongoose.isValidObjectId(videoId)

    if (!videoIdIsValid) {
        throw new ApiError(400, "videoId is required")
    }

    const addCommentResponse = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, { addCommentResponse }, "comment add successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // Todo: update a comment
    const { commentId } = req.params

    const { content } = req.body

    if (!content || content == "") {
        throw new ApiError(400, "content is required")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "invalid comment id")
    }

    const verifiedComment = comment.owner.toString() == req.user?._id.toString()

    if (!verifiedComment) { throw new ApiError(403, "You are not authorized") }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {content},
        },
        {
            new: true,
        }
    )


    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // Todo: delete a comment
    const{ commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "comment is required")
    }

    const verifiedUser = comment.owner.toString() == req.user?._id.toString()

    if (!verifiedUser) {
        throw new ApiError(400, "You are not authorized")
    }

    await Comment.findByIdAndDelete(
        commentId,
    )

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "comment deleted succcessfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
}