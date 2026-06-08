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
            // Added 'pt-20' padding adjustments to balance navbar overlaps inside skeleton frames
            <div className="w-full min-h-screen bg-slate-950 pt-20 px-4 md:p-8 space-y-6 sm:space-y-8 flex flex-col justify-start">
                <div className="max-w-6xl mx-auto w-full space-y-6">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-indigo-400 animate-spin">
                            <Compass className="w-5 h-5" />
                        </div>
                        <div className="h-5 bg-slate-900 rounded w-48 sm:w-64" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse">
                                <div className="aspect-video bg-slate-900/80 rounded-xl w-full" />
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-900/80 shrink-0" />
                                    <div className="flex-1 space-y-2 py-0.5">
                                        <div className="h-3.5 bg-slate-900/80 rounded w-5/6" />
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
        // Added standard pt-20 layout padding shifts and pb-24 clearance bars for 375px viewports
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-3.5 sm:px-6 lg:px-8 pb-24 lg:pb-12 relative overflow-x-hidden font-sans select-none selection:bg-indigo-500/30">
            
            {/* Ambient Lighting Spots */}
            <div className="absolute top-0 right-1/4 w-72 h-72 sm:w-100 sm:h-100 bg-indigo-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-100 sm:h-100 bg-purple-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8 box-border w-full">
                
                {/* --- HEADER TITLE PANEL --- */}
                <div className="border-b border-slate-900 pb-4 sm:pb-5 pl-0.5">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2.5 max-w-full overflow-hidden">
                        <span className="h-4 w-1 bg-linear-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full shrink-0" />
                        <span className="truncate">Results for:</span> 
                        <span className="text-indigo-400 lowercase font-mono truncate max-w-37.5 xs:max-w-none">"{query}"</span>
                    </h2>
                </div>

                {/* --- SEARCH RESULTS VIEW SHELF --- */}
                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-md mx-auto mt-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-3.5 text-slate-500 shadow-inner">
                            <Search className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-xs font-semibold text-slate-300">No Match Found</h3>
                        <p className="text-[11px] text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                            No transcoded video files match this specific query. Adjust keywords or try search filters.
                        </p>
                    </div>
                ) : (
                    // Balanced gaps to completely eliminate boundary leaks
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-300 w-full box-border">
                        {videos.map((video) => (
                            <div 
                                key={video._id} 
                                onClick={() => navigate(`/video/${video._id}`)}
                                className="group flex flex-col cursor-pointer rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/40 hover:shadow-xl hover:shadow-indigo-500/5 sm:hover:-translate-y-1.5 shadow-md w-full box-border"
                            >
                                {/* Thumbnail Frame */}
                                <div className="aspect-video w-full overflow-hidden relative bg-slate-950 border-b border-slate-900/85">
                                    <img 
                                        src={video.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=640"} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                                            <Play className="w-4 h-4 fill-indigo-400/30 translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Metadata panel */}
                                <div className="p-3.5 sm:p-4 flex gap-3 items-start flex-1 bg-slate-950/5 min-w-0">
                                    <img 
                                        src={video.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.owner?.username}`} 
                                        className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full object-cover border border-slate-700 bg-slate-900 shrink-0" 
                                        alt="avatar" 
                                    />
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <h3 className="font-semibold text-xs sm:text-sm text-slate-100 line-clamp-2 leading-snug transition-colors group-hover:text-indigo-400 min-h-8">
                                            {video.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-semibold truncate pt-0.5">
                                            {video.owner?.fullName || video.owner?.username}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold font-mono">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3 opacity-80 shrink-0" />
                                                {video.views?.toLocaleString() || 0} views
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