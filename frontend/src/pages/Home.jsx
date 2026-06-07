import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- INDIVIDUAL VIDEO CARD (HOVER PLAY + AUDIO PREVIEW) ---
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
                        console.log("Autoplay preview standard block bypass: ", err);
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
            className="flex flex-col group cursor-pointer w-full transition-all duration-200"
        >
            {/* Thumbnail Box */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#212121] w-full shadow-md">
                {/* Static Thumbnail */}
                <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Hover Auto-Play Video element */}
                {isHovered && (
                    <video
                        ref={videoRef}
                        src={video.videoFile || video.videoUrl || video.video} 
                        muted={isMuted}
                        playsInline
                        loop
                        className="absolute inset-0 w-full h-full object-cover z-10 bg-black"
                    />
                )}

                {/* Video Duration Badge */}
                {!isHovered && (
                    <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
                        {video.duration ? `${minutes}:${seconds}` : "10:00"}
                    </span>
                )}

                {/* Speaker Sound Icon (Only appears when video previews) */}
                {isHovered && (
                    <button
                        onClick={handleMuteToggle}
                        className="absolute bottom-2 right-2 z-20 bg-black/75 hover:bg-black text-white p-1.5 rounded-full transition-all focus:outline-none border border-zinc-800/30"
                    >
                        {isMuted ? (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Title & Metadata Layout (Directly below thumbnail, exact Youtube style) */}
            <div className="flex gap-3 pt-3">
                <img 
                    src={video.ownerDetails?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.ownerDetails?.username}`} 
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-zinc-850 bg-zinc-900"
                    alt="channel profile"
                />
                <div className="flex flex-col min-w-0">
                    <h3 className="font-semibold text-sm text-[#f1f1f1] line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {video.title}
                    </h3>
                    <p className="text-xs text-[#aaaaaa] mt-1.5 hover:text-white transition-colors truncate font-medium">
                        {video.ownerDetails?.username || "Channel Name"}
                    </p>
                    <p className="text-[11px] text-[#aaaaaa] mt-0.5 truncate">
                        {video.views?.toLocaleString() || 0} views • {formatTimeAgo(video.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN HOME CONTAINER (BLACK BG DARK THEME) ---
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
            <div className="w-full h-full min-h-screen p-4 space-y-6 bg-[#0f0f0f]">
                {/* Horizontal Category Pill Skeleton */}
                <div className="flex space-x-3 overflow-hidden pb-1">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="h-8 w-20 bg-[#212121] rounded-lg animate-pulse" />
                    ))}
                </div>
                {/* Grid Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="space-y-3 animate-pulse">
                            <div className="aspect-video bg-[#212121] rounded-xl w-full" />
                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#212121] shrink-0" />
                                <div className="flex-1 space-y-2 py-0.5">
                                    <div className="h-4 bg-[#212121] rounded w-5/6" />
                                    <div className="h-3 bg-[#212121] rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-screen p-4 md:p-6 space-y-6 bg-[#0f0f0f] text-white select-none">
            
            {/* Category Pills Bar (True Dark Version) */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                            activeFilter === filter
                                ? "bg-white text-zinc-950 font-bold"
                                : "bg-[#212121] text-zinc-100 hover:bg-[#303030]"
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Video Cards Grid */}
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                    {videos.map((video) => (
                        <VideoCard 
                            key={video._id} 
                            video={video} 
                            onClick={() => navigate(`/video/${video._id}`)} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-zinc-500 font-medium">
                    No videos found. Try adjusting your filters or check back later!
                </div>
            )}
        </div>
    );
};

export default Home;