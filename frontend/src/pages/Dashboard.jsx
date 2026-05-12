import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Users, Eye, Video, Heart, Plus ,CheckCircle, XCircle} from 'lucide-react'; // Plus icon add kiya
import UploadVideo from "./UploadVideo"; // Is file ko import karna mat bhoolna

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // Modal control state
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
                // Typo fix: VideoResponse
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

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await apiClient.delete(`/videos/${videoId}`);
            // Remove the deleted video from the state
            setVideos(videos.filter(video => video._id !== videoId));
            alert("Video deleted successfully!");
        } catch (error) {
            console.error("Error deleting video:", error);
        }
    };

    const handleTogglePublish = async (videoId) => {
        try {
            const response = await apiClient.patch(`/videos/toggle/publish/${videoId}`);
            setVideos(videos.map(video => video._id === videoId ? { ...video, isPublished: !video.isPublished } : video));
        } catch (error) {
            console.error("Error toggling video publish status:", error);
        }
    };

    if (loading) {
        return <div className="text-white text-center mt-10 animate-pulse">Loading Dashboard...</div>
    }

    const StatCard = ({ icon, label, value, color }) => (
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 ${color} rounded-lg`}>{icon}</div>
                <span className="text-sm text-slate-400 font-medium">{label}</span>
            </div>
            <h3 className="text-3xl font-bold">{value?.toLocaleString() || 0}</h3>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Profile Section */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <img
                            src={user?.avatar}
                            alt="avatar"
                            className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
                        />
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold">{user?.fullName}</h1>
                            <p className="text-slate-400">@{user?.username}</p>
                        </div>
                        <div className="md:ml-auto flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                            {/* NEW: Upload Button */}
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                            >
                                <Plus size={20} /> Upload Video
                            </button>
                            <div className="px-4 py-2 bg-slate-700 rounded-lg">
                                <p className="text-xs text-slate-400">Account Status</p>
                                <p className="text-sm text-green-400 font-medium">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6">Channel Statistics</h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={<Users className="text-purple-500" />} label="Subscribers" value={stats?.subscribers} color="bg-purple-500/10" />
                    <StatCard icon={<Eye className="text-blue-500" />} label="Total Views" value={stats?.totalViews} color="bg-blue-500/10" />
                    <StatCard icon={<Video className="text-green-500" />} label="Total Videos" value={stats?.totalVideos} color="bg-green-500/10" />
                    <StatCard icon={<Heart className="text-red-500" />} label="Total Likes" value={stats?.totalLikes} color="bg-red-500/10" />
                </div>

                {/* Video Table ya List yahan videos state se map kar sakte ho */}

                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl mt-10">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-xl font-bold">Manage Videos</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-slate-400 text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Video</th>
                                    <th className="px-6 py-4 font-medium">Date Uploaded</th>
                                    <th className="px-6 py-4 font-medium">Views</th>
                                    <th className="px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {videos.length > 0 ? videos.map((video) => (
                                    <tr key={video._id} className="hover:bg-slate-700/30 transition">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleTogglePublish(video._id)}
                                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${video.isPublished ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                    }`}
                                            >
                                                {video.isPublished ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                {video.isPublished ? "Published" : "Private"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={video.thumbnail} alt="thumb" className="w-16 h-10 object-cover rounded-lg border border-slate-600" />
                                                <span className="font-medium truncate max-w-200px">{video.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{video.views}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <button className="text-slate-400 hover:text-blue-500 transition"><Edit size={18} /></button>
                                                <button
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
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                            No videos found. Upload your first video, bhai!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/login")}
                    className="mt-8 px-6 py-2 text-white border-2 border-red-500 bg-transparent hover:bg-red-500 font-medium rounded-full transition-all duration-300 flex items-center gap-2 w-fit"
                >
                    Logout from account
                </button>

                {/* UPLOAD MODAL COMPONENT */}
                <UploadVideo
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                />
            </div>
        </div>
    );
};

export default Dashboard;