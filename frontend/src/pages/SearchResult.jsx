import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Compass, Eye, Sparkles, Play, Video, Calendar } from "lucide-react";
import apiClient from "../api/apiConfig.js";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;
            try {
                setLoading(true);
                const response = await apiClient.get(`/videos/search?query=${encodeURIComponent(query)}`);
                setVideos(response.data?.data || []);
            } catch (error) {
                console.error("Search API Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-slate-950 p-4 md:p-8 space-y-8 flex flex-col justify-center">
                <div className="max-w-6xl mx-auto w-full space-y-6">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-indigo-400 animate-spin">
                            <Compass className="w-5 h-5" />
                        </div>
                        <div className="h-6 bg-slate-900 rounded w-64" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse">
                                <div className="aspect-video bg-slate-900/80 rounded-xl w-full" />
                                <div className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-900/80 shrink-0" />
                                    <div className="flex-1 space-y-2 py-0.5">
                                        <div className="h-4 bg-slate-900/80 rounded w-5/6" />
                                        <div className="h-3 bg-slate-900/80 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden font-sans select-none selection:bg-indigo-500/30">
            
            {/* Ambient Lighting Spots */}
            <div className="absolute top-0 right-1/4 w-100 h-100 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-100 h-100 bg-purple-500/5 rounded-full blur-[110px] pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                
                {/* --- HEADER TITLE PANEL --- */}
                <div className="border-b border-slate-900 pb-5">
                    <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2.5">
                        <span className="h-4.5 w-1 bg-linear-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
                        Search Results for: <span className="text-indigo-400 lowercase font-mono">"{query}"</span>
                    </h2>
                </div>

                {/* --- SEARCH RESULTS VIEW SHELF --- */}
                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-xl mx-auto">
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-4 text-slate-500">
                            <Search className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-semibold text-slate-300">No Match Found</h3>
                        <p className="text-[11px] text-slate-500 mt-2 max-w-xs leading-relaxed">
                            No transcoded video files match this specific query. Adjust keywords or try search filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        {videos.map((video) => (
                            <div 
                                key={video._id} 
                                onClick={() => navigate(`/video/${video._id}`)}
                                className="group flex flex-col cursor-pointer rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/40 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1.5 shadow-md"
                            >
                                {/* Thumbnail Frame */}
                                <div className="aspect-video w-full overflow-hidden relative bg-slate-950 border-b border-slate-900/85">
                                    <img 
                                        src={video.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=640"} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                                            <Play className="w-5 h-5 fill-indigo-400/30 translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Metadata panel */}
                                <div className="p-4 flex gap-3.5 items-start flex-1 bg-slate-950/5">
                                    <img 
                                        src={video.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.owner?.username}`} 
                                        className="w-8.5 h-8.5 rounded-full object-cover border border-slate-800 shrink-0" 
                                        alt={`${video.owner?.fullName || "owner"} avatar`} 
                                    />
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <h3 className="font-semibold text-xs md:text-sm text-slate-100 line-clamp-2 leading-snug transition-colors group-hover:text-indigo-400">
                                            {video.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-semibold truncate pt-1">
                                            {video.owner?.fullName || video.owner?.username}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold font-mono">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5 opacity-80" />
                                                {video.views?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;