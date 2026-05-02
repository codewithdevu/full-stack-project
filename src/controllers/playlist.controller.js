import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";

const createPlaylist = asyncHandler(async(req , res) => {
    // Todo: create playlist
})

const getUserPlaylists = asyncHandler(async(req , res) => {
    // Todo: get USER playlists
}) 

const getPlaylistById = asyncHandler(async(req , res) => {
    // Todo: remove video from playlist
})

const addVideoToPlaylist = asyncHandler(async(req , res) => {
    const {playlistId , videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async(req , res) => {
    const {videoId , playlistId} = req.params
    // Todo: remove video from playlist
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