import mongoose, { plugin } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
    // Todo: create playlist
    const { name , description } = req.body

    if ([name, description].some((field) => field?.trim() == "")) {
        throw new ApiError(400, " name or descirption field is reqiured")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
        videos: []
    })

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist create successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    // Todo: get USER playlists
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "userId is reqiured")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "invalid user Id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videosDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "userVideoDetails"
                        },
                    },
                    {
                        $addFields: {
                            userDetails: {
                                $first: "$userVideoDetails"
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            description: 1,
                            "userDetails.username": 1,
                            "userDetails.avatar": 1,
                            "userDetails.fullName": 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videosDetails"
                }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist of User by Id "))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    // Todo: remove video from playlist
    const { playlistId } = req.params
    console.log(playlistId);
    

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlistId is reqiured")
    }

    const ownerPlaylist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videosDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "userVideoDetails"
                        },
                    },
                    {
                        $addFields: {
                            userDetails: {
                                $first: "$userVideoDetails"
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            description: 1,
                            "userDetails.username": 1,
                            "userDetails.avatar": 1,
                            "userDetails.fullName": 1,
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerPlaylist"
            }
        },
        {
            $addFields: {
                ownerPlaylist: {
                    $first: "$ownerPlaylist"
                }
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, ownerPlaylist[0], "owner of the playlist"))


})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId , playlistId } = req.params
    console.log("playlistId" , playlistId);
    console.log("videoId" , videoId);
    

    if (!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlistId")
    } 

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid  videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized: Only owner can add video")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: videoId }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "video fetched in playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // Todo: remove video from playlist
    const { videoId, playlistId } = req.params

    if (!mongoose.isValidObjectId(videoId) || !mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistID or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized: Only owner can add video")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "remove video in playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    // Todo: delete playlist
    const { playlistId } = req.params

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "UnAunthorized: Only owner can delete the playlist")
    }

    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    await Playlist.findByIdAndDelete(
        playlistId
    )

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "playlist deleted succcessfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    // Todo: update playlist
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId")
    }

    if ([name, description].some((field) => field.trim() == "")) {
        throw new ApiError(400, "name or descirption is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "UnAunthorized: Only owner can update the playlist")
    }

    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        {
            new: true
        })

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "name and description updated successfully"))
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