import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Playlist } from "../models/playlist.model";
import { ApiResponse } from "../utils/ApiResponse";

const createPlaylist = asyncHandler(async(req , res) => {
    // Todo: create playlist
    const {name , description} = req.body

    if ([name , description].some((field) => field?.trim() == "")) {
        throw new ApiError(400 , " name or descirption field is reqiured")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
        videos: []
    })

    return res
    .status(200)
    .json(new ApiResponse(200 , playlist , "playlist create successfully"))

})

const getUserPlaylists = asyncHandler(async(req , res) => {
    // Todo: get USER playlists
}) 

const getPlaylistById = asyncHandler(async(req , res) => {
    // Todo: remove video from playlist
})

const addVideoToPlaylist = asyncHandler(async(req , res) => {
    const {playlistId , videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400 , "invalid playlistId or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "playlist not found")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized: Only owner can add video")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {videos: videoId}
        },
        {
            new: true
        }
    )

    return res
    .status(200) 
    .json(new ApiResponse(200, updatedPlaylist , "video fetched in playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async(req , res) => {
    // Todo: remove video from playlist
    const {videoId , playlistId} = req.params

    if (!mongoose.isValidObjectId(videoId)  || !mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistID or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "playlist not found")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized: Only owner can add video")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {videos: videoId}
        },
        {
            new: true
        }
    )

    return res
    .status(200) 
    .json(new ApiResponse(200, updatedPlaylist , "remove video in playlist successfully"))
})

const deletePlaylist = asyncHandler(async(req , res) => {
    const {playlistId} = req.params
    // Todo: delete playlist
})

const updatePlaylist = asyncHandler(async(req , res) => {
    const {playlistId , videoId} = req.params
    const {name , description} = req.body
    // Todo: update playlist
})

export {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}