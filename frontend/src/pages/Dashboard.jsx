import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Users, Eye, Video, Heart, Plus, CheckCircle, XCircle } from 'lucide-react';
import UploadVideo from "./UploadVideo";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const UserResponse = await apiClient.get("/users/current-user");
                if (UserResponse.data) {
                    setUser(UserResponse.data.data);
                }

                const [statsResponse, VideoResponse] = await Promise.all([
                    apiClient.get("/dashboard/stats"),
                    apiClient.get("/dashboard/videos"),
                ]);

                if (statsResponse.data) setStats(statsResponse.data.data);
                if (VideoResponse.data) setVideos(VideoResponse.data.data);

            } catch (error) {
                console.error("Error: while fetching the data", error);
                if (error.response?.status === 401) navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await apiClient.post("/users/logout");
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateVideo = async (e) => {
        e.preventDefault();
        if (!editingVideo.title.trim()) {
            return alert("Title cannot be empty!");
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("title", editingVideo.title);
            formData.append("description", editingVideo.description);
            if (editingVideo.newThumbnail) {
                formData.append("thumbnail", editingVideo.newThumbnail);
            }

            const response = await apiClient.patch(`/videos/${editingVideo._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                setVideos(prev => prev.map(video => video._id === editingVideo._id ? response.data.data : video));
                alert("Video updated successfully!");
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Error updating video:", error);
            alert("Failed to update video. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await apiClient.delete(`/videos/${videoId}`);
            setVideos(videos.filter(video => video._id !== videoId));
            alert("Video deleted successfully!");
        } catch (error) {
            console.error("Error deleting video:", error);
        }
    };

    const handleTogglePublish = async (videoId) => {
        try {
            await apiClient.patch(`/videos/toggle/publish/${videoId}`);
            setVideos(videos.map(video => video._id === videoId ? { ...video, isPublished: !video.isPublished } : video));
        } catch (error) {
            console.error("Error toggling video publish status:", error);
        }
    };

    if (loading) {
        return <div className="text-white text-center mt-10 animate-pulse">Loading Dashboard...</div>
    }

    return (
        // Wrapper container ko strict layout widths ke andar secure kiya hai
        <div className="min-h-screen bg-slate-800 text-white p-4 pb-24 lg:pb-8 select-none w-full max-w-93.75 sm:max-w-7xl mx-auto overflow-hidden box-border">
            <div className="w-full space-y-6 min-w-0">

                {/* PROFILE CARD */}
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700/60 shadow-xl w-full box-border">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-5 w-full">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left w-full md:w-auto">
                            <div className="relative shrink-0">
                                <img
                                    src={user?.avatar}
                                    alt="avatar"
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-blue-500/80 object-cover shadow-md shadow-blue-500/10"
                                />
                                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full animate-pulse md:hidden" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 truncate">{user?.fullName || "Hemantnath"}</h1>
                                <p className="text-slate-400 text-xs md:text-sm font-medium truncate">@{user?.username || "hemantyogi"}</p>
                            </div>
                        </div>

                        {/* Buttons & Status Row */}
                        <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/10"
                            >
                                <Plus size={16} /> Upload Video
                            </button>
                            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/40 border border-slate-700/40 rounded-xl text-[11px]">
                                <span className="text-slate-400 font-medium">Account Status</span>
                                <span className="text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATISTICS SECTION */}
                <div className="w-full min-w-0 box-border">
                    <h2 className="text-sm md:text-base font-bold text-slate-400 tracking-wider uppercase mb-3 pl-0.5">Channel Statistics</h2>

                    {/* 🟢 FIXED GRID SYSTEM: Width elements locked using tight sizing guidelines */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0 box-border">
                        {/* Card 1 */}
                        <div className="bg-slate-800 border border-slate-700/60 p-3.5 rounded-xl shadow-md flex flex-col justify-between h-24 min-w-0 overflow-hidden box-border">
                            <div className="flex items-center justify-between w-full gap-1">
                                <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider uppercase truncate">Subscribers</span>
                                <div className="p-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-500 shrink-0">
                                    <Users size={14} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-50 truncate">{stats?.subscribers?.toLocaleString() || 5}</h3>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-slate-800 border border-slate-700/60 p-3.5 rounded-xl shadow-md flex flex-col justify-between h-24 min-w-0 overflow-hidden box-border">
                            <div className="flex items-center justify-between w-full gap-1">
                                <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider uppercase truncate">Total Views</span>
                                <div className="p-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500 shrink-0">
                                    <Eye size={14} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-50 truncate">{stats?.totalViews?.toLocaleString() || 284}</h3>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-slate-800 border border-slate-700/60 p-3.5 rounded-xl shadow-md flex flex-col justify-between h-24 min-w-0 overflow-hidden box-border">
                            <div className="flex items-center justify-between w-full gap-1">
                                <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider uppercase truncate">Total Videos</span>
                                <div className="p-1 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 shrink-0">
                                    <Video size={14} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-50 truncate">{stats?.totalVideos?.toLocaleString() || 2}</h3>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-slate-800 border border-slate-700/60 p-3.5 rounded-xl shadow-md flex flex-col justify-between h-24 min-w-0 overflow-hidden box-border">
                            <div className="flex items-center justify-between w-full gap-1">
                                <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider uppercase truncate">Total Likes</span>
                                <div className="p-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 shrink-0">
                                    <Heart size={14} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-50 truncate">{stats?.totalLikes?.toLocaleString() || 1}</h3>
                        </div>
                    </div>
                </div>

                {/* Video Table / Cards Container */}
                <div className="bg-slate-800 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl mt-4 w-full box-border">
                    <div className="p-4 border-b border-slate-700/60 bg-slate-800/40">
                        <h3 className="text-sm md:text-base font-bold text-slate-200">Manage Videos</h3>
                    </div>

                    {/* LAPTOP VIEW */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/40 text-slate-400 text-xs tracking-wider uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Video</th>
                                    <th className="px-6 py-4">Date Uploaded</th>
                                    <th className="px-6 py-4">Views</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {videos.length > 0 ? videos.map((video) => (
                                    <tr key={video._id} className="hover:bg-slate-700/20 transition">
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePublish(video._id)}
                                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${video.isPublished ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                                            >
                                                {video.isPublished ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                {video.isPublished ? "Published" : "Private"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={video.thumbnail} alt="thumb" className="w-16 h-10 object-cover rounded-lg border border-slate-600 shrink-0" />
                                                <span className="font-medium truncate max-w-50">{video.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{video.views}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingVideo(video);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="text-slate-400 hover:text-blue-500 transition"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteVideo(video._id)}
                                                    className="text-slate-400 hover:text-red-500 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500 text-sm">
                                            No videos found. Upload your first video, bhai!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE VIEW */}
                    <div className="block md:hidden p-4 space-y-4 divide-y divide-slate-700/40 w-full box-border">
                        {videos.length > 0 ? videos.map((video, index) => (
                            <div key={video._id} className={`flex flex-col gap-3 w-full min-w-0 ${index !== 0 ? "pt-4" : ""}`}>
                                <div className="flex gap-3 w-full min-w-0">
                                    <img src={video.thumbnail} alt="thumb" className="w-20 h-12 object-cover rounded-xl border border-slate-700 shrink-0" />
                                    <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                                        <span className="font-semibold text-xs text-slate-200 block truncate">{video.title}</span>
                                        <div className="flex items-center justify-between text-[10px] text-slate-400 w-full min-w-0 gap-2">
                                            <span className="shrink-0">{new Date(video.createdAt).toLocaleDateString()}</span>
                                            <span className="font-semibold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded truncate">{video.views} views</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-slate-900/30 p-2 rounded-xl border border-slate-700/40 w-full box-border">
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePublish(video._id)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${video.isPublished ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                                    >
                                        {video.isPublished ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        {video.isPublished ? "Published" : "Private"}
                                    </button>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingVideo(video);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-blue-400 transition"
                                        >
                                            <Edit size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteVideo(video._id)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 transition"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500 text-xs">
                                No videos found. Upload your first video, bhai!
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="w-full pt-2">
                    <button
                        type="button"
                        onClick={() => handleLogout()}
                        className="w-full sm:w-fit px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/30 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 flex items-center gap-2 justify-center"
                    >
                        Logout from account
                    </button>
                </div>

                {/* UPLOAD MODAL COMPONENT */}
                <UploadVideo
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                />

                {/* EDIT MODAL COMPONENT */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl p-4 shadow-2xl mx-auto box-border">
                            <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-slate-100">
                                <Edit size={16} className="text-blue-500" /> Edit Video Details
                            </h2>

                            <form onSubmit={handleUpdateVideo} className="space-y-3.5">
                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={editingVideo?.title}
                                        onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-blue-500 transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Description</label>
                                    <textarea
                                        value={editingVideo?.description}
                                        onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                                        rows="2"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-blue-500 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1.5">Change Thumbnail</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditingVideo({ ...editingVideo, newThumbnail: e.target.files[0] })}
                                        className="text-[10px] text-slate-500 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-blue-600/10 file:text-blue-500 hover:file:bg-blue-600/20 w-full"
                                    />
                                </div>

                                <div className="flex gap-2.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300 transition font-medium text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-2 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 text-white transition disabled:opacity-50 text-xs"
                                    >
                                        {loading ? "Updating..." : "Update"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;