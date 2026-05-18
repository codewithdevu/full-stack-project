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
        <div className="min-h-screen bg-slate-900 text-white p-3 md:p-8 pb-24 lg:pb-8 select-none">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* 🟢 HEADER SECTION: Responsive text size and clear history button */}
                <div className="flex justify-between items-center pl-1">
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-100">Watch History</h1>
                        <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Videos you've watched recently</p>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-red-400 hover:text-red-300 transition px-3 py-1.5 rounded-xl bg-red-500/5 border border-red-500/10 active:scale-95"
                        >
                            <Trash2 size={14} md:size={16} /> Clear All
                        </button>
                    )}
                </div>

                {/* HISTORY FLOW */}
                {history.length === 0 ? (
                    <div className="text-center text-slate-500 py-20 text-sm md:text-base border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                        No watch history found. Kuch dekho bhai!
                    </div>
                ) : (
                    <div className="flex flex-col gap-3.5">
                        {history.map((video) => (
                            <div
                                key={video._id}
                                onClick={() => navigate(`/video/${video._id}`)}
                                className="flex flex-col sm:flex-row gap-3 md:gap-4 bg-slate-800/40 p-2.5 md:p-3 rounded-2xl border border-slate-800/60 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer group"
                            >
                                {/* 🟢 THUMBNAIL: Smart adaptive frame down to 375px */}
                                <div className="relative w-full sm:w-44 md:w-56 lg:w-64 aspect-video shrink-0 overflow-hidden rounded-xl border border-slate-700/30 bg-black">
                                    <img 
                                        src={video.thumbnail} 
                                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300" 
                                        alt="thumbnail" 
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                                </div>

                                {/* 🟢 DETAILS ROW: Text constraints fix */}
                                <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0 px-1">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-sm md:text-base text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition">
                                            {video.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium truncate">
                                            {video.owner?.fullName || "Channel Name"} • {video.views?.toLocaleString() || 0} views
                                        </p>
                                        <p className="text-[11px] md:text-xs text-slate-500 line-clamp-1 sm:line-clamp-2 leading-relaxed pt-0.5 hidden xs:block">
                                            {video.description || "No description provided."}
                                        </p>
                                    </div>
                                    
                                    {/* Timestamp tag */}
                                    <p className="text-[10px] text-slate-600 mt-2 font-medium tracking-wide border-t border-slate-800/30 pt-1.5 sm:border-none sm:pt-0">
                                        Watched: {new Date(video.updatedAt || Date.now()).toLocaleDateString()}
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