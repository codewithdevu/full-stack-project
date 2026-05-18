import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Play, Clock, LayoutGrid, ListVideo, Edit2 } from "lucide-react";

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
                videos: prev.videos.filter((video) => video._id !== videoId),
            }));
        } catch (error) {
            console.error("Error removing video from playlist:", error);
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Loading playlist...</div>;
    }

    if (!playlist) {
        return <div className="text-center mt-10">Playlist not found.</div>;
    }

 return (
        <div className="min-h-screen bg-slate-900 text-white p-3 md:p-10 pb-24 lg:pb-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* 🟢 PLAYLIST HEADER SECTION - Fully Responsive Stack */}
                <div className="bg-linear-to-r from-blue-900/30 to-slate-800/60 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-700/50 shadow-xl">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-end">
                        {/* Thumbnail Cover */}
                        <div className="w-full md:w-64 aspect-video bg-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl border border-slate-700/30 shrink-0 overflow-hidden relative">
                            {playlist.videosDetails?.length > 0 ? (
                                <img src={playlist.videosDetails[0].thumbnail} className="w-full h-full object-cover opacity-70" alt="playlist cover" />
                            ) : (
                                <LayoutGrid size={40} className="text-slate-600" />
                            )}
                        </div>
                        
                        {/* Meta Content */}
                        <div className="flex-1 text-center md:text-left min-w-0 w-full">
                            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-100 truncate tracking-tight">{playlist.name}</h1>
                            <p className="text-slate-400 text-sm mt-1 md:mt-2 line-clamp-2 md:line-clamp-none leading-relaxed">
                                {playlist.description || "No description provided."}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-slate-300 mt-4 border-t border-slate-700/50 pt-3 md:border-none md:pt-0">
                                <span className="flex items-center gap-1.5 font-medium"><ListVideo size={16} className="text-blue-500" /> {playlist.videosDetails?.length || 0} videos</span>
                                <span className="flex items-center gap-1.5 font-medium"><Clock size={16} className="text-slate-400" /> Updated recently</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🟢 VIDEOS LIST - Down to 375px fluid adaptation */}
                <div className="space-y-3">
                    {playlist.videosDetails?.length > 0 ? (
                        playlist.videosDetails.map((video, index) => (
                            <div
                                key={video._id || index}
                                className="flex items-center gap-2 md:gap-4 bg-slate-800/40 p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-800/60 group hover:border-blue-500/40 transition-all duration-200"
                            >
                                {/* Index Number */}
                                <span className="text-slate-500 text-xs md:text-sm font-bold text-center w-5 shrink-0 pl-1">{index + 1}</span>
                                
                                {/* Image Container (Width fluid scaled for small mobiles) */}
                                <div
                                    className="relative w-28 sm:w-36 md:w-44 aspect-video shrink-0 cursor-pointer rounded-lg overflow-hidden border border-slate-700/30"
                                    onClick={() => navigate(`/video/${video._id}`)}
                                >
                                    <img src={video.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                        <Play fill="white" size={24} className="text-white" />
                                    </div>
                                </div>
                                
                                {/* Video Titles */}
                                <div className="flex-1 min-w-0 px-1 md:px-2">
                                    <h3 
                                        className="font-bold text-xs sm:text-sm md:text-base text-slate-200 line-clamp-1 cursor-pointer hover:text-blue-400 transition"
                                        onClick={() => navigate(`/video/${video._id}`)}
                                    >
                                        {video.title}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">@{video.userDetails?.username || "creator"}</p>
                                </div>
                                
                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemoveVideo(video._id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition shrink-0 mr-1"
                                >
                                    <Trash2 size={16} md:size={18} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 text-slate-500 text-sm italic">Is playlist mein koi video nahi hai.</div>
                    )}
                </div>

                {/* 🟢 BOTTOM ACTIONS ROW */}
                <div className="flex items-center justify-center gap-4 md:gap-6 pt-4 w-full">
                    <button
                        onClick={() => {
                            setEditData({ name: playlist.name, description: playlist.description });
                            setIsEditModelOpen(true);
                        }}
                        className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
                    >
                        <Edit2 size={16} /> Edit Playlist
                    </button>

                    <button
                        onClick={() => handleDeletePlaylist(playlist._id)}
                        className="flex-1 sm:flex-initial bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white px-4 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm border border-red-500/20 hover:border-red-600 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} /> Delete Playlist
                    </button>
                </div>
            </div>

            {/* --- RESPONSIVE EDIT MODAL --- */}
            {isEditModelOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-5 md:p-6 shadow-2xl mx-2">
                        <h2 className="text-lg font-bold mb-4 text-slate-100">Update Playlist Details</h2>

                        <form onSubmit={handleEditPlaylist} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Playlist Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Description</label>
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    rows="3"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModelOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition font-medium text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 text-white transition text-xs"
                                >
                                    Save Changes
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