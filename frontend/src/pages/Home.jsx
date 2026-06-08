import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Volume2, VolumeX, Eye, Calendar, Sparkles } from "lucide-react";
import apiClient from "../api/apiConfig.js";

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

// ==========================================
// INDIVIDUAL VIDEO CARD (HOVER PLAY + GLASS)
// ==========================================
const VideoCard = ({ video, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);
    const hoverTimeout = useRef(null);

    useEffect(() => {
        if (isHovered) {
            hoverTimeout.current = setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.play().catch((err) => {
                        console.log("Autoplay preview block bypass: ", err);
                    });
                }
            }, 500);
        } else {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
        return () => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        };
    }, [isHovered]);

    const handleMuteToggle = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const minutes = Math.floor((video.duration || 0) / 60);
    const seconds = Math.floor((video.duration || 0) % 60).toString().padStart(2, "0");

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group flex flex-col cursor-pointer w-full rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/40 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1.5"
        >
            {/* Thumbnail Box */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950/80 border-b border-slate-900/80">

                {/* Static Thumbnail with zoom overlay */}
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Hover Auto-Play Video element */}
                {isHovered && (
                    <video
                        ref={videoRef}
                        src={video.videoFile || video.videoUrl || video.video}
                        muted={isMuted}
                        playsInline
                        loop
                        className="absolute inset-0 w-full h-full object-cover z-10 bg-slate-950 animate-in fade-in duration-300"
                    />
                )}

                {/* Gradient vignette for badges */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-15" />

                {/* Video Duration Badge */}
                {!isHovered && (
                    <span className="absolute bottom-3 right-3 z-20 bg-slate-950/70 backdrop-blur-md text-slate-200 text-[10px] font-semibold tracking-wider font-mono px-2 py-0.5 rounded-lg border border-slate-800/80 shadow-md">
                        {video.duration ? `${minutes}:${seconds}` : "10:00"}
                    </span>
                )}

                {/* Speaker Sound Icon (Only appears when video previews) */}
                {isHovered && (
                    <button
                        onClick={handleMuteToggle}
                        className="absolute bottom-3 right-3 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-slate-200 hover:text-white p-2 rounded-xl transition-all hover:scale-105 focus:outline-none"
                    >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                )}

                {/* Absolute Play Button overlay on Hover */}
                {!isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                            <Play className="w-5 h-5 fill-indigo-400/30 translate-x-0.5" />
                        </div>
                    </div>
                )}
            </div>

            {/* Title & Metadata Layout */}
            <div className="flex gap-3 p-4 flex-1">
                {/* Channel Profile */}
                <div className="relative shrink-0">
                    <img
                        src={video.ownerDetails?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.ownerDetails?.username}`}
                        alt="Channel profile"
                        className="w-10 h-10 min-w-10 min-h-10 rounded-full object-cover border border-slate-700 bg-slate-900"
                    />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-slate-100 leading-snug line-clamp-2 transition-colors group-hover:text-indigo-400">
                        {video.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-2 hover:text-slate-200 transition-colors truncate font-medium">
                        {video.ownerDetails?.username || "Channel Name"}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 opacity-80" />
                            {video.views?.toLocaleString() || 0}
                        </span>
                        <span className="text-slate-700">•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 opacity-80" />
                            {formatTimeAgo(video.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN HOME CONTAINER (PREMIUM SLATE-950 THEME)
// ==========================================
const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const navigate = useNavigate();

    const filters = ["All", "Gaming", "Music", "Tech", "Podcasts", "Live", "JavaScript", "Comedy", "React"];

    useEffect(() => {
        const fetchAllVideos = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/videos?page=1&limit=12");
                if (response.data?.data?.docs) {
                    setVideos(response.data.data.docs);
                }
            } catch (error) {
                console.error("Error while fetching videos: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllVideos();
    }, []);

    if (loading) {
        return (
            <div className="w-full min-h-screen p-4 md:p-6 space-y-8 bg-slate-950">
                {/* Horizontal Category Pill Skeleton */}
                <div className="flex space-x-3 overflow-hidden pb-2 border-b border-slate-900/40">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="h-8 w-20 bg-slate-900/60 border border-slate-800/30 rounded-xl animate-pulse" />
                    ))}
                </div>
                {/* Grid Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse">
                            <div className="aspect-video bg-slate-900/80 rounded-xl w-full" />
                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-900/80 shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-slate-900/80 rounded w-5/6" />
                                    <div className="h-3 bg-slate-900/80 rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4 md:p-6 space-y-8 bg-slate-950 text-slate-100 select-none relative z-10">

            {/* Category Pills Bar (Glass Premium Version) */}
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-3 scrollbar-none border-b border-slate-900/40">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 border active:scale-[0.98] ${activeFilter === filter
                                ? "bg-linear-to-r from-indigo-500/15 to-purple-500/15 border-indigo-500/40 text-indigo-200 shadow-md shadow-indigo-500/5 font-bold"
                                : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-100 hover:bg-slate-900/60"
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Video Cards Grid */}
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    {videos.map((video) => (
                        <VideoCard
                            key={video._id}
                            video={video}
                            onClick={() => navigate(`/video/${video._id}`)}
                        />
                    ))}
                </div>
            ) : (
                /* Empty Premium State */
                <div className="flex flex-col items-center justify-center text-center py-32 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-xl mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">No Premium Streams Found</h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                        Adjust your active category filter or check back later for high-performance HLS uploads.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Home;