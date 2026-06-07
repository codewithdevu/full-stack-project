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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-12">
            
            {/* --- HEADER SECTION --- */}
            <header className="mb-10">
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-600 to-violet-700 p-1 shadow-2xl shadow-indigo-500/20">
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-linear-to-tr from-indigo-500 to-fuchsia-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                                <img
                                    src={user?.avatar}
                                    alt="avatar"
                                    className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-slate-800 object-cover shadow-2xl"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                                    {user?.fullName || "Creator Studio"}
                                </h1>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className="text-indigo-400 font-medium">@{user?.username}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                                        Pro Channel
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                <Plus size={20} /> Upload New Video
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 md:flex-none inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all font-semibold"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- STATISTICS GRID --- */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <div className="h-5 w-1 bg-indigo-500 rounded-full"></div>
                        Channel Analytics
                    </h2>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: 'Subscribers', val: stats?.subscribers, icon: <Users />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Total Views', val: stats?.totalViews, icon: <Eye />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { label: 'Videos', val: stats?.totalVideos, icon: <Video />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Total Likes', val: stats?.totalLikes, icon: <Heart />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                    ].map((item, i) => (
                        <div key={i} className="group bg-slate-900/50 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                    {React.cloneElement(item.icon, { size: 20 })}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-black text-white mb-1">
                                {item.val?.toLocaleString() || '0'}
                            </div>
                            <p className="text-xs font-medium text-slate-400">{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- VIDEO MANAGEMENT TABLE --- */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Latest Uploads</h3>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Video Details</th>
                                <th className="px-6 py-4 text-center">Date</th>
                                <th className="px-6 py-4 text-center">Views</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {videos.length > 0 ? videos.map((video) => (
                                <tr key={video._id} className="group hover:bg-indigo-500/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleTogglePublish(video._id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-sm ${
                                                video.isPublished 
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                                : "bg-slate-700/30 text-slate-400 border border-slate-700"
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${video.isPublished ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`}></span>
                                            {video.isPublished ? "Published" : "Draft"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative shrink-0">
                                                <img src={video.thumbnail} alt="thumb" className="w-24 h-14 object-cover rounded-xl shadow-lg border border-slate-700 group-hover:border-indigo-500/50 transition-colors" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-100 truncate w-48 lg:w-64">{video.title}</h4>
                                                <p className="text-xs text-slate-500 truncate max-w-xs">{video.description || "No description provided."}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-400">
                                        {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-slate-800 rounded-lg font-bold text-indigo-400 text-xs">
                                            {video.views.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingVideo(video); setIsEditModalOpen(true); }}
                                                className="p-2 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-lg transition-all"
                                                title="Edit Video"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVideo(video._id)}
                                                className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                                                title="Delete Video"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <Video size={48} className="mb-4" />
                                            <p className="text-lg font-medium">No videos found yet</p>
                                            <p className="text-sm">Ready to share your story with the world?</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE LIST */}
                <div className="md:hidden divide-y divide-slate-800">
                    {videos.map((video) => (
                        <div key={video._id} className="p-4 bg-slate-900/30">
                            <div className="flex gap-4 mb-4">
                                <img src={video.thumbnail} alt="thumb" className="w-24 h-16 object-cover rounded-xl border border-slate-700" />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-100 text-sm truncate">{video.title}</h4>
                                    <p className="text-[10px] text-slate-500 mt-1">{new Date(video.createdAt).toLocaleDateString()}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold text-indigo-400">{video.views} views</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                                <button
                                    onClick={() => handleTogglePublish(video._id)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${video.isPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}
                                >
                                    {video.isPublished ? "Live" : "Draft"}
                                </button>
                                <div className="flex gap-1">
                                    <button onClick={() => { setEditingVideo(video); setIsEditModalOpen(true); }} className="p-2 text-slate-400"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteVideo(video._id)} className="p-2 text-red-400/70"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* MODALS */}
            <UploadVideo isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

            {isEditModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-4xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute right-6 top-6 p-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <XCircle size={24} />
                        </button>

                        <h2 className="text-2xl font-black mb-6 text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                                <Edit size={24} />
                            </div>
                            Edit Video
                        </h2>

                        <form onSubmit={handleUpdateVideo} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Video Title</label>
                                <input
                                    type="text"
                                    value={editingVideo?.title}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-500/10"
                                    placeholder="Enter eye-catching title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Description</label>
                                <textarea
                                    value={editingVideo?.description}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                                    rows="4"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-500/10 resize-none"
                                    placeholder="What is this video about?"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">New Thumbnail</label>
                                <div className="relative group cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditingVideo({ ...editingVideo, newThumbnail: e.target.files[0] })}
                                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                    />
                                    <div className="bg-slate-950 border-2 border-dashed border-slate-800 group-hover:border-indigo-500/50 rounded-2xl p-4 text-center transition-all">
                                        <p className="text-xs text-slate-500 group-hover:text-indigo-400 font-medium">
                                            {editingVideo?.newThumbnail ? editingVideo.newThumbnail.name : "Drag & drop or click to upload new thumbnail"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-4 bg-indigo-600 rounded-2xl font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                >
                                    {loading ? "Saving Changes..." : "Update Video"}
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