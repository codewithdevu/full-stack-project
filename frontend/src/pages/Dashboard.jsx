import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { 
    Trash2, Edit, Users, Eye, Video, Heart, Plus, 
    CheckCircle, XCircle, LogOut, ArrowUpRight, BarChart3,
    Calendar, Sparkles, Image, Check, X
} from 'lucide-react';
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
        return (
            <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-spin">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">Syncing creator studio nodes...</span>
                </div>
            </div>
        );
    }

return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
        
        {/* Ambient Glow Backdrops */}
        <div className="absolute top-0 right-1/4 w-100 h-100 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-10 left-1/4 w-112.5 h-112.5 bg-purple-500/5 rounded-full blur-[130px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 relative z-10 space-y-10">
            
            {/* --- HEADER SECTION --- */}
            <header>
                <div className="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-[1.5px] shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-70 pointer-events-none" />
                    <div className="relative bg-slate-950/80 rounded-[15px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                            {/* Avatar profile wrap with glowing boundary */}
                            <div className="relative group shrink-0">
                                <div className="absolute -inset-1 bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
                                <img
                                    src={user?.avatar}
                                    alt="User avatar"
                                    className="relative w-24 h-24 md:w-26 md:h-26 rounded-full border border-slate-800/80 object-cover shadow-2xl"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
                                    {user?.fullName || "Creator Studio"}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold">
                                    <span className="text-indigo-400">@{user?.username}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-800 hidden sm:inline" />
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-linear-to-r from-indigo-500/15 to-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px]">
                                        <Sparkles className="w-3 h-3" /> Pro Channel
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action controllers */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="relative group overflow-hidden rounded-xl px-5 py-3 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:opacity-90" />
                                <span className="absolute -inset-px rounded-xl bg-linear-to-r from-indigo-400 to-pink-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />
                                <span className="relative flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Upload Video
                                </span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all duration-300 text-xs font-semibold"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>

                    </div>
                </div>
            </header>

            {/* --- STATISTICS GRID --- */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        Live Dashboard Analytics
                    </h2>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Subscribers', val: stats?.subscribers, icon: <Users />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { label: 'Total Views', val: stats?.totalViews, icon: <Eye />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                        { label: 'Videos Uploaded', val: stats?.totalVideos, icon: <Video />, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                        { label: 'Total Appreciations', val: stats?.totalLikes, icon: <Heart />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                    ].map((item, i) => (
                        <div key={i} className="group relative bg-slate-900/30 border border-slate-800/85 p-5 rounded-xl hover:border-slate-700/80 transition-all duration-300 overflow-hidden shadow-md">
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                    {React.cloneElement(item.icon, { className: "w-4.5 h-4.5" })}
                                </div>
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    Real-time
                                </span>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight font-mono">
                                {item.val?.toLocaleString() || '0'}
                            </div>
                            <p className="text-xs font-medium text-slate-400 mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- VIDEO MANAGEMENT LISTS --- */}
            <section className="bg-slate-900/30 border border-slate-800/85 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
                <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/20">
                    <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" /> Stream Catalog Overview
                    </h3>
                    <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-1 rounded-lg font-semibold">
                        Total: {videos.length} Streams
                    </span>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950/45 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800/40">
                            <tr>
                                <th className="px-6 py-4">Release State</th>
                                <th className="px-6 py-4">Video Information</th>
                                <th className="px-6 py-4 text-center">Date Added</th>
                                <th className="px-6 py-4 text-center">Total Views</th>
                                <th className="px-6 py-4 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/60 bg-slate-950/5">
                            {videos.length > 0 ? videos.map((video) => (
                                <tr key={video._id} className="group hover:bg-slate-900/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleTogglePublish(video._id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm border active:scale-95 ${
                                                video.isPublished 
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                : "bg-slate-950 text-slate-500 border-slate-800"
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${video.isPublished ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
                                            {video.isPublished ? "Published" : "Draft"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative shrink-0 w-24 aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 group-hover:border-slate-700/80 transition-colors">
                                                <img src={video.thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 max-w-xs xl:max-w-md">
                                                <h4 className="font-semibold text-xs text-slate-100 truncate">{video.title}</h4>
                                                <p className="text-[10px] text-slate-500 truncate mt-1">{video.description || "No description provided."}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs font-semibold text-slate-400 font-mono">
                                        {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-950 border border-slate-900 text-slate-300 rounded-md font-bold text-[11px] font-mono">
                                            {video.views.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => { setEditingVideo(video); setIsEditModalOpen(true); }}
                                                className="p-1.5 bg-slate-950/40 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-indigo-400 rounded-lg transition-all"
                                                title="Edit Video"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVideo(video._id)}
                                                className="p-1.5 bg-slate-950/40 border border-slate-800/50 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                                                title="Delete Video"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-500">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-3">
                                                <Video className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-300">No uploads archived</p>
                                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Ready to begin broadcasting? Tap upload above to trigger the HLS compiler nodes.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE LIST */}
                <div className="md:hidden divide-y divide-slate-900/60">
                    {videos.map((video) => (
                        <div key={video._id} className="p-4 bg-slate-950/10">
                            <div className="flex gap-4 mb-4">
                                <img src={video.thumbnail} alt="thumbnail" className="w-24 h-16 object-cover rounded-xl border border-slate-800" />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-100 text-xs truncate">{video.title}</h4>
                                    <div className="flex items-center gap-2 text-[10px] mt-1 text-slate-500">
                                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="font-mono">{video.views} views</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-900">
                                <button
                                    onClick={() => handleTogglePublish(video._id)}
                                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                        video.isPublished 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-slate-950 text-slate-500 border-slate-800"
                                    }`}
                                >
                                    {video.isPublished ? "Live" : "Draft"}
                                </button>
                                <div className="flex gap-1.5">
                                    <button onClick={() => { setEditingVideo(video); setIsEditModalOpen(true); }} className="p-1.5 bg-slate-950 border border-slate-900 rounded-lg text-slate-400"><Edit className="w-3.5 h-3.5"/></button>
                                    <button onClick={() => handleDeleteVideo(video._id)} className="p-1.5 bg-slate-950 border border-slate-900 rounded-lg text-rose-400/80"><Trash2 className="w-3.5 h-3.5"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* MODALS */}
            <UploadVideo isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-950/90 border border-slate-800/80 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        
                        <button 
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute right-6 top-6 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 hover:scale-105 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-lg font-bold mb-6 text-slate-100 flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                                <Edit className="w-4.5 h-4.5" />
                            </div>
                            Edit Video Details
                        </h2>

                        <form onSubmit={handleUpdateVideo} className="space-y-4">
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Video Title</label>
                                <input
                                    type="text"
                                    value={editingVideo?.title}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60"
                                    placeholder="Enter descriptive title"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Description</label>
                                <textarea
                                    value={editingVideo?.description}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                                    rows="4"
                                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60 resize-none"
                                    placeholder="Provide detailed description"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Custom Thumbnail File</label>
                                <div className="relative group cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditingVideo({ ...editingVideo, newThumbnail: e.target.files[0] })}
                                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                    />
                                    <div className="bg-slate-950/40 border-2 border-dashed border-slate-800/80 group-hover:border-indigo-500/30 rounded-xl p-4 text-center transition-colors">
                                        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium group-hover:text-indigo-300">
                                            <Image className="w-4 h-4 text-slate-500" />
                                            <span>
                                                {editingVideo?.newThumbnail ? editingVideo.newThumbnail.name : "Select raw thumbnail file"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal submission trigger */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full group overflow-hidden rounded-xl py-3 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
                            >
                                <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 to-purple-600 transition-all duration-300 group-hover:opacity-90" />
                                <span className="relative flex items-center justify-center gap-1.5">
                                    {loading ? "Re-transcoding meta..." : "Save Changes"}
                                </span>
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

export default Dashboard;