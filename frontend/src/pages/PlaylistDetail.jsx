import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Play, Clock, LayoutGrid, ListVideo } from "lucide-react";

const PlaylistDetail = () => {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
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
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="bg-linear-to-r from-blue-900/40 to-slate-800 p-8 rounded-3xl border border-slate-700 mb-10">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="w-full md:w-64 aspect-video bg-slate-700 rounded-2xl flex items-center justify-center shadow-2xl">
                            {playlist.videosDetails?.length > 0 ? (
                                <img src={playlist.videosDetails[0].thumbnail} className="w-full h-full object-cover rounded-2xl opacity-60" />
                            ) : (
                                <LayoutGrid size={48} className="text-slate-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-extrabold mb-2">{playlist.name}</h1>
                            <p className="text-slate-400 mb-4">{playlist.description || "No description provided."}</p>
                            <div className="flex gap-4 text-sm text-slate-300">
                                <span className="flex items-center gap-1"><ListVideo size={16}/> {playlist.videosDetails?.length} videos</span>
                                <span className="flex items-center gap-1"><Clock size={16}/> Updated recently</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Videos List */}
                <div className="space-y-4">
                    {playlist.videosDetails?.length > 0 ? (
                        playlist.videosDetails.map((video, index) => (
                            <div 
                                key={video._id || index}
                                className="flex gap-4 bg-slate-800/30 p-3 rounded-2xl border border-slate-800 group hover:border-blue-500/50 transition items-center"
                            >
                                <span className="text-slate-600 font-bold ml-2 w-4">{index + 1}</span>
                                <div 
                                    className="relative w-44 aspect-video shrink-0 cursor-pointer"
                                    onClick={() => navigate(`/video/${video._id}`)}
                                >
                                    <img src={video.thumbnail} className="w-full h-full object-cover rounded-lg" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg">
                                        <Play fill="white" size={30} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg line-clamp-1 cursor-pointer hover:text-blue-400" 
                                        onClick={() => navigate(`/video/${video._id}`)}>
                                        {video.title}
                                    </h3>
                                    <p className="text-sm text-slate-400">@{video.userDetails?.username}</p>
                                </div>
                                <button 
                                    onClick={() => handleRemoveVideo(video._id)}
                                    className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-600 italic">Is playlist mein koi video nahi hai.</div>
                    )}
                </div>
            </div>
        </div>
    );        
};

export default PlaylistDetail;