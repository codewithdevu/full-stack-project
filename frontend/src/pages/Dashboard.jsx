import React from "react";
import apiClient from "../api/apiConfig";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Users, Eye, Video, Heart } from 'lucide-react';



const Dashboard = (e) => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // pehele current User fetch karo 
                const UserResponse = await apiClient.get("/users/current-user");
                if (UserResponse.data) {
                    setUser(UserResponse.data.data);
                }

                // stats aur video parallel fetch 
                const [statsResponse, VideoResponse] = await Promise.all([
                    apiClient.get("/dashboard/stats"),
                    apiClient.get("/dashboard/videos"),
                ]);

                if (statsResponse.data) setStats(statsResponse.data.data);
                if (VideoRepsonse) setVideos(VideoRepsonse.data.data)

            } catch (error) {
                console.error("Error: while fetching the data", error);
                if (error.response?.status === 401) navigate("/login")
            } finally {
                setLoading(false)
            }
        };
        fetchAllData();
    }, [navigate]);

    if (loading) {
        return <div className="text-white text-center mt-10">Loading Dashboard...</div>
    }

    // Reusable StatCard Component
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
                        <div className="md:ml-auto flex gap-4 mt-4 md:mt-0">
                            <div className="px-4 py-2 bg-slate-700 rounded-lg">
                                <p className="text-xs text-slate-400">Email Address</p>
                                <p className="text-sm font-medium">{user?.email}</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-700 rounded-lg">
                                <p className="text-xs text-slate-400">Account Status</p>
                                <p className="text-sm text-green-400 font-medium">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6">Channel Statistics</h2>

                {/* 2. MIDDLE SECTION: Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={<Users className="text-purple-500" />} label="Subscribers" value={stats?.subscribers} color="bg-purple-500/10" />
                    <StatCard icon={<Eye className="text-blue-500" />} label="Total Views" value={stats?.totalViews} color="bg-blue-500/10" />
                    <StatCard icon={<Video className="text-green-500" />} label="Total Videos" value={stats?.totalVideos} color="bg-green-500/10" />
                    <StatCard icon={<Heart className="text-red-500" />} label="Total Likes" value={stats?.totalLikes} color="bg-red-500/10" />
                </div>

                <button
                    onClick={() => navigate("/login")}
                    className="mt-8 px-6 py-2 text-white border bg-red-500 hover:bg-red-700 hover:text-shadow-amber-100 font-medium rounded-full transition-all duration-300 flex items-center gap-2 w-fit"
                >
                    Logout from account
                </button>
            </div>
        </div>
    );
};

export default Dashboard;