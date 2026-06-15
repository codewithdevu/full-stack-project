import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { Trash2, Clock, Calendar, Eye, Compass } from "lucide-react";

const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;

    return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/users/history`);
            
            console.log("🔍 Debug History Payload:", response.data?.data); 
            const rawHistory = response.data?.data || [];
            
            const sanitizedHistory = rawHistory.filter(video => {
                if (!video) return false;
                if (!video.status) return true; 

                const currentStatus = video.status.toLowerCase();
                return currentStatus === "processed" || currentStatus === "completed";
            });
            
            setHistory(sanitizedHistory);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-slate-950 pt-20 px-4 md:p-8 space-y-8 flex flex-col justify-start">
                <div className="max-w-4xl mx-auto w-full space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
                        <div className="space-y-2">
                            <div className="h-6 bg-slate-900 rounded w-48" />
                            <div className="h-3 bg-slate-900 rounded w-32" />
                        </div>
                        <div className="h-9 bg-slate-900 rounded-xl w-24 shrink-0" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-4 md:px-8 pb-24 lg:pb-12 select-none relative overflow-x-hidden font-sans selection:bg-indigo-500/30">
            
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-1/4 w-72 h-72 sm:w-100 sm:h-100 bg-indigo-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />

            <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 relative z-10 box-border w-full">
                
                {/* --- HEADER BLOCK --- */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-900/80 pb-4 sm:pb-5">
                    <div className="space-y-0.5 flex-1 min-w-0">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                            <Clock className="w-5 h-5 text-indigo-400 shrink-0" /> Watch History
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1 hidden sm:block truncate">
                            A compilation of transcoded streams you've previously accessed
                        </p>
                    </div>
                    
                    {history && history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold text-rose-400 hover:text-rose-300 transition-all duration-300 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 hover:bg-rose-500/15 active:scale-95 shadow-md w-full sm:w-auto shrink-0"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Clear Archive
                        </button>
                    )}
                </div>

                {/* --- CHRONOLOGICAL WATCH FEED CONTAINER (FIXED ISOLATION LAYER) --- */}
                {history && history.length > 0 ? (
                    // 🟢 VIEW MODE A: Renders exclusively when actual records exist
                    <div className="flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-300 w-full">
                        {history.map((video, idx) => {
                            if (!video) return null;
                            // Strict unique structural key creation using index mesh for handling repetitive re-watch structures safely
                            const uniqueItemKey = `${video._id}-${idx}`;
                            
                            return (
                                <div
                                    key={uniqueItemKey}
                                    onClick={() => navigate(`/video/${video._id}`)}
                                    className="group flex flex-col sm:flex-row gap-4 bg-slate-900/20 p-3.5 rounded-2xl border border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900/40 transition-all duration-300 cursor-pointer shadow-md box-border w-full overflow-hidden"
                                >
                                    {/* Thumbnail Frame */}
                                    <div className="relative w-full sm:w-44 md:w-56 shrink-0 aspect-video overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80 group-hover:border-slate-700 transition-colors duration-300">
                                        <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={video.title} />
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 to-transparent pointer-events-none" />
                                    </div>

                                    {/* Content Meta Panel */}
                                    <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0 w-full">
                                        <div className="space-y-1.5 w-full">
                                            <h3 className="font-semibold text-xs sm:text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors duration-200">
                                                {video.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400 font-medium">
                                                <span className="text-slate-200">{video.owner?.fullName || video.ownerDetails?.fullName || "Channel Name"}</span>
                                                <span className="text-slate-700">•</span>
                                                <span className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                                                    <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    {video.views?.toLocaleString() || 0} views
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-1 hidden xs:block">
                                                {video.description || "No description provided."}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold tracking-wide border-t border-slate-900/60 pt-2.5 mt-3 sm:border-none sm:pt-0 sm:mt-2 font-mono w-full">
                                            <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                            <span className="truncate">Accessed: {formatTimeAgo(video.updatedAt || video.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // 🟢 VIEW MODE B: Standalone clean fallback card block triggered exclusively when array hits absolute zero
                    <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-md mx-auto mt-6 px-4 animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-3.5 text-slate-500 shadow-inner">
                            <Clock className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-xs font-semibold text-slate-300">Archive Empty</h3>
                        <p className="text-[11px] text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                            No active watch history. Head over to the primary video catalog to discover active streams.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;