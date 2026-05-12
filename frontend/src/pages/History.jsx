import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate} from "react-router-dom";
import { Trash2, PlayCircle } from "lucide-react";

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/users/history`);
            console.log("response", response.data);
            
            setHistory(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHistory();
    }, []);

    const clearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear your history?")) return;
        try {
            await apiClient.delete("/users/history/clear");
            setHistory([]);
        } catch (error) {
            console.error("Error clearing history:", error);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading History...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Watch History</h1>
                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
                        >
                            <Trash2 size={18} /> Clear All
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="text-center text-slate-500 mt-20">
                        No watch history found. Kuch dekho bhai!
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {history.map((video) => (
                            <div
                                key={video._id}
                                onClick={() => navigate(`/video/${video._id}`)}
                                className="flex flex-col md:flex-row gap-4 bg-slate-800/40 p-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition cursor-pointer group"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-full md:w-64 aspect-video shrink-0 overflow-hidden rounded-lg">
                                    <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" alt="" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                                </div>

                                {/* Details */}
                                <div className="flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="text-lg font-bold line-clamp-2">{video.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {video.owner?.fullName} • {video.views} views
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
                                            {video.description}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-4">
                                        Watched on: {new Date(video.updatedAt || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;