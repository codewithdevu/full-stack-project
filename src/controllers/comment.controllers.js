import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


const getVideoComments = asyncHandler(async (req, res) => {
    // Todo: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
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
            owner: user
        })

        return res
            .status(200)
            .json(new ApiResponse(200, { addCommentResponse }, "comment add successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // Todo: update a comment
})

const deleteComment = asyncHandler(async (Req, res) => {
    // Todo: delete a comment
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
}