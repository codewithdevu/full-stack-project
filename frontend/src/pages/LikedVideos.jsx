import React, { useEffect, useState } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, Eye, Sparkles, Loader2 } from "lucide-react";

const LikedVideos = () => {
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/likes/videos`);
                
                // 🟢 Filter rules: Sirf unhi valid videos ko load karenge jo DB me hain aur processing state crash target nahi hain
                const rawLikes = response.data?.data || [];
                const validVideos = rawLikes.filter(item => 
                    item && item.video && (!item.video.status || item.video.status === "processed")
                );
                
                setLikedVideos(validVideos);
            } catch (error) {
                console.error("Error fetching liked videos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLikedVideos();
    }, [])

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-slate-950 pt-20 px-4 md:p-8 space-y-6 sm:space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800" />
                    <div className="h-6 bg-slate-900 rounded w-48" />
                </div>
                {/* Video Grid Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse">
                            <div className="aspect-video bg-slate-900/80 rounded-xl w-full" />
                            <div className="space-y-2 py-1">
                                <div className="h-4 bg-slate-900/80 rounded w-5/6" />
                                <div className="h-3 bg-slate-900/80 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-4 md:p-8 pb-24 lg:pb-12 relative overflow-x-hidden font-sans selection:bg-indigo-500/30">

            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 sm:w-100 sm:h-100 bg-indigo-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8 box-border">

                {/* --- HEADER BLOCK --- */}
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5 sm:gap-3 pl-0.5">
                    <div className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
                        <ThumbsUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    Liked Streams
                </h1>

                {/* --- CONTENT AREA --- */}
                {likedVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 sm:py-32 px-4 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-md mx-auto mt-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-3.5 text-slate-500 shadow-inner">
                            <ThumbsUp className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-xs font-semibold text-slate-300">No Liked Streams Found</h3>
                        <p className="text-[11px] text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                            Discover high-quality creators and like their videos to compile them in your personal reference list.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-300 w-full box-border">
                        {likedVideos.map((item) => {
                            if (!item || !item.video) return null;
                            return (
                                <div
                                    key={item._id}
                                    onClick={() => navigate(`/video/${item.video._id}`)}
                                    className="group flex flex-col cursor-pointer rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/40 hover:shadow-xl hover:shadow-indigo-500/5 sm:hover:-translate-y-1 w-full box-border"
                                >
                                    {/* Thumbnail Frame */}
                                    <div className="relative aspect-video bg-slate-950 border-b border-slate-900/80 overflow-hidden">
                                        <img
                                            src={item.video.thumbnail}
                                            alt={item.video.title}
                                            className="w-full h-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>

                                    {/* Title & Creator Information */}
                                    <div className="p-3.5 sm:p-4 flex flex-col flex-1 min-w-0">
                                        <h3 className="font-semibold text-xs sm:text-sm text-slate-100 leading-snug line-clamp-2 transition-colors group-hover:text-indigo-400 min-h-8">
                                            {item.video.title || "Untitled Video"}
                                        </h3>
                                        <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-900/60 w-full min-w-0">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 border border-slate-700/80 overflow-hidden shrink-0">
                                                <img
                                                    src={
                                                        item.video.ownerDetails?.avatar ||
                                                        item.video.owner?.avatar ||
                                                        `https://api.dicebear.com/7.x/initials/svg?seed=${item.video.ownerDetails?.username || "Channel"}`
                                                    }
                                                    alt="Creator"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate flex-1 min-w-0">
                                                {item.video.ownerDetails?.username || item.video.owner?.username || "Unknown Creator"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LikedVideos;