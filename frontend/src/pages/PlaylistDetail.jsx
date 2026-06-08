import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Play, Clock, LayoutGrid, ListVideo, Edit2, X, FileText, Compass, Sparkles } from "lucide-react";

const PlaylistDetail = () => {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModelOpen, setIsEditModelOpen] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        description: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlaylistVideos = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/playlist/${playlistId}`);
                setPlaylist(response.data?.data);
            } catch (error) {
                console.error("Error fetching playlist videos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (playlistId) {
            fetchPlaylistVideos();
        }

    }, [playlistId]);

    const handleEditPlaylist = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await apiClient.patch(`/playlist/${playlistId}`, {
                name: editData.name,
                description: editData.description,
            });

            if (response.data?.success) {
                setPlaylist(prev => ({
                    ...prev,
                    name: response.data.data.name,
                    description: response.data.data.description,
                }));
                setIsEditModelOpen(false);
                alert("Playlist updated successfully!");
            }
        } catch (error) {
            console.error("Error updating playlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;
        try {
            await apiClient.delete(`/playlist/${playlistId}`);
            alert("Playlist deleted successfully!");
            navigate("/playlists");
        } catch (error) {
            console.error("Error deleting playlist:", error);
        }
    };

    const handleRemoveVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to remove this video from the playlist?")) return;
        try {
            await apiClient.patch(`/playlists/remove/${videoId}/${playlistId}/`);

            setPlaylist((prev) => ({
                ...prev,
                videosDetails: prev.videosDetails.filter((video) => video._id !== videoId),
            }));
        } catch (error) {
            console.error("Error removing video from playlist:", error);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/85 flex items-center justify-center text-indigo-400 animate-spin">
                        <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading Collection Streams...</span>
                </div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-rose-400">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">Collection Unreachable</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        The collection playlist details could not be found. Try returning to the dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 pb-24 lg:pb-12 relative overflow-hidden font-sans select-none selection:bg-indigo-500/30">

            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-1/4 w-100 h-100 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none z-0" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">

                {/* --- 1. PLAYLIST HEADER SECTION --- */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900/30 backdrop-blur-xl border border-slate-900/80 p-[1.5px] shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500/5 to-purple-500/5 opacity-75 pointer-events-none" />

                    <div className="relative bg-slate-950/45 rounded-[15px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-end">

                        {/* Cover Image container */}
                        <div className="w-full md:w-56 aspect-video bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800/80 shrink-0 overflow-hidden relative shadow-lg">
                            {playlist.videosDetails?.length > 0 ? (
                                <>
                                    <img src={playlist.videosDetails[0].thumbnail} className="w-full h-full object-cover opacity-50" alt="Collection preview" />
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                </>
                            ) : (
                                <LayoutGrid className="w-10 h-10 text-slate-700" />
                            )}
                        </div>

                        {/* Information Row */}
                        <div className="flex-1 text-center md:text-left min-w-0 w-full space-y-2">
                            <h1 className="text-xl md:text-3xl font-bold text-slate-100 truncate tracking-tight">{playlist.name}</h1>
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                                {playlist.description || "No description provided."}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] font-semibold text-slate-300 mt-4 pt-3 border-t border-slate-900/80 md:border-none md:pt-0">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <ListVideo className="w-3.5 h-3.5" /> {playlist.videosDetails?.length || 0} Streams
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-slate-500">
                                    <Clock className="w-3.5 h-3.5" /> Updated recently
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- 2. VIDEOS LIST catalog --- */}
                <div className="space-y-3 animate-in fade-in duration-300">
                    {playlist.videosDetails?.length > 0 ? (
                        playlist.videosDetails.map((video, index) => (
                            <div
                                key={video._id || index}
                                className="flex items-center gap-3 md:gap-4 bg-slate-900/20 p-2.5 rounded-xl border border-slate-900/80 group hover:border-indigo-500/20 hover:bg-slate-900/35 transition-all duration-300 shadow-sm"
                            >
                                {/* Index Number formatted in Monospace styling */}
                                <span className="text-slate-500 text-xs font-bold text-center w-5 shrink-0 pl-1 font-mono">{String(index + 1).padStart(2, '0')}</span>

                                {/* Image Container */}
                                <div
                                    className="relative w-28 sm:w-36 md:w-44 aspect-video shrink-0 cursor-pointer rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950"
                                    onClick={() => navigate(`/video/${video._id}`)}
                                >
                                    <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={video.title} />
                                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                                            <Play className="w-4.5 h-4.5 fill-indigo-400/30 translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Video Titles */}
                                <div className="flex-1 min-w-0 px-1 md:px-2">
                                    <h3
                                        className="font-semibold text-xs sm:text-sm text-slate-200 line-clamp-1 cursor-pointer hover:text-indigo-400 transition-colors"
                                        onClick={() => navigate(`/video/${video._id}`)}
                                    >
                                        {video.title}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-1 font-semibold truncate">@{video.userDetails?.username || "creator"}</p>
                                </div>

                                {/* Remove Video action */}
                                <button
                                    onClick={() => handleRemoveVideo(video._id)}
                                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg border border-transparent hover:border-rose-500/10 transition-colors shrink-0 mr-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm">
                            <Compass className="w-8 h-8 text-slate-600 mb-3" />
                            <h4 className="text-xs font-semibold text-slate-300">Collection Empty</h4>
                            <p className="text-[11px] text-slate-500 mt-1">This collection does not contain any videos yet.</p>
                        </div>
                    )}
                </div>

                {/* --- 3. BOTTOM OPERATIONS CONTROLS ROW --- */}
                <div className="flex items-center justify-center gap-4 pt-4 w-full border-t border-slate-900/80">
                    <button
                        onClick={() => {
                            setEditData({
                                name: playlist.name,
                                description: playlist.description,
                            });
                            setIsEditModelOpen(true);
                        }}
                        className="relative flex-1 sm:flex-initial group overflow-hidden rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <span className="relative flex items-center justify-center gap-2 text-white">
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit Playlist
                        </span>
                    </button>
                    <button
                        onClick={() => handleDeletePlaylist(playlist._id)}
                        className="flex-1 sm:flex-initial bg-rose-500/15 text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-500/20 hover:border-transparent px-6 py-3 rounded-xl font-semibold text-xs transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-sm shadow-rose-500/10"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Playlist
                    </button>
                </div>
            </div>

            {/* --- RESPONSIVE EDIT COLLECTION MODAL --- */}
            {isEditModelOpen && (
                <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                    <div className="bg-slate-950 border border-slate-800/80 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

                        <button
                            onClick={() => setIsEditModelOpen(false)}
                            className="absolute right-6 top-6 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase mb-6 flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                                <Edit2 className="w-4 h-4" />
                            </div>
                            Update Archive Details
                        </h2>

                        <form onSubmit={handleEditPlaylist} className="space-y-4">

                            {/* Playlist Name Field */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-0.5">Playlist Name</label>
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 pointer-events-none transition-colors">
                                        <Sparkles className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-550 transition-all duration-300
                                            focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description area */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-0.5">Description</label>
                                <div className="relative group">
                                    <span className="absolute top-3.5 left-3.5 flex text-slate-600 group-hover:text-slate-400 pointer-events-none transition-colors">
                                        <FileText className="w-4 h-4" />
                                    </span>
                                    <textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        rows="3"
                                        className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-550 transition-all duration-300 resize-none h-24
                                            focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModelOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs font-semibold transition-all"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="relative flex-1 group overflow-hidden rounded-xl py-3 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 to-purple-600 transition-all duration-300 group-hover:opacity-90 animate-pulse" />
                                    <span className="relative flex items-center justify-center">
                                        Save Changes
                                    </span>
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistDetail;