import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Volume2, VolumeX, Eye, Calendar, Sparkles, Loader2, AlertCircle } from "lucide-react";
import Hls from "hls.js"; // 🟢 HLS Player Stream preview capability jodi gayi hai
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
// INDIVIDUAL VIDEO CARD (HLS HOVER PREVIEW + PIPELINE BADGES)
// ==========================================
const VideoCard = ({ video, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const hoverTimeout = useRef(null);

    // Dynamic processing variables setup
    const isPending = video.status === "pending";
    const isProcessing = video.status === "processing";
    const isFailed = video.status === "failed";
    const isReady = !video.status || video.status === "processed";

    useEffect(() => {
        if (isHovered && isReady) {
            hoverTimeout.current = setTimeout(() => {
                const videoEl = videoRef.current;
                if (!videoEl) return;

                // Stream link priorities: Master HLS Playlist -> Fallback standard URL streams
                const streamUrl = video.hlsMasterUrl || video.videoFile || video.videoUrl || video.video;

                if (streamUrl && streamUrl.includes(".m3u8")) {
                    if (Hls.isSupported()) {
                        const hls = new Hls({
                            maxMaxBufferLength: 5, // Prefetch buffer limited to 5s for fast thumb previews
                            enableWorker: true
                        });
                        hlsRef.current = hls;
                        hls.loadSource(streamUrl);
                        hls.attachMedia(videoEl);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            videoEl.play().catch(err => console.log("Autoplay block: ", err));
                        });
                    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                        videoEl.src = streamUrl;
                        videoEl.play().catch(err => console.log("Autoplay block: ", err));
                    }
                } else if (streamUrl) {
                    // Fallback to absolute raw links for legacy storage rows
                    videoEl.src = streamUrl;
                    videoEl.play().catch(err => console.log("Autoplay fallback failure: ", err));
                }
            }, 500);
        } else {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            
            // Cleanup HLS instance immediately on mouse leave
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.removeAttribute('src');
                videoRef.current.load();
            }
        }
        return () => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [isHovered, video.hlsMasterUrl, video.videoFile, isReady]);

    const handleMuteToggle = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const minutes = Math.floor((video.duration || 0) / 60);
    const seconds = Math.floor((video.duration || 0) % 60).toString().padStart(2, "0");

    return (
        <div 
            onClick={isReady ? onClick : null} // Disable clicks if transcoding is not finished
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group flex flex-col w-full max-w-full rounded-2xl border overflow-hidden transition-all duration-300 backdrop-blur-md relative ${
                isProcessing ? "border-amber-500/30 bg-amber-950/5 cursor-wait" :
                isPending ? "border-blue-500/30 bg-blue-950/5 cursor-wait" :
                isFailed ? "border-rose-500/30 bg-rose-950/5 cursor-not-allowed" :
                "border-slate-900 bg-slate-900/20 cursor-pointer hover:border-indigo-500/30 hover:bg-slate-900/40 hover:shadow-xl hover:shadow-indigo-500/5 sm:hover:-translate-y-1.5"
            }`}
        >
            {/* Thumbnail / HLS Preview Box */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950/80 border-b border-slate-900/80">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className={`w-full h-full object-cover transition-all duration-500 sm:group-hover:scale-105 ${isHovered && isReady ? 'opacity-0' : 'opacity-100'}`}
                />

                {isHovered && isReady && (
                    <video
                        ref={videoRef}
                        muted={isMuted}
                        playsInline
                        loop
                        className="absolute inset-0 w-full h-full object-cover z-10 bg-slate-950 animate-in fade-in duration-300"
                    />
                )}

                {/* Status Overlay Badges */}
                {!isReady && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-25 p-4 text-center">
                        {isPending && (
                            <>
                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                <span className="text-blue-300 text-[11px] font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 shadow-sm animate-pulse">In Transcoding Queue</span>
                            </>
                        )}
                        {isProcessing && (
                            <>
                                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                                <span className="text-amber-300 text-[11px] font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm animate-pulse">Processing Resolutions...</span>
                            </>
                        )}
                        {isFailed && (
                            <>
                                <AlertCircle className="w-5 h-5 text-rose-400" />
                                <span className="text-rose-300 text-[11px] font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 shadow-sm">Transcoding Failed</span>
                            </>
                        )}
                    </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-15" />

                {isReady && !isHovered && (
                    <span className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 z-20 bg-slate-950/70 backdrop-blur-md text-slate-200 text-[10px] font-semibold tracking-wider font-mono px-1.5 py-0.5 rounded-md border border-slate-800/80 shadow-md">
                        {video.duration ? `${minutes}:${seconds}` : "0:00"}
                    </span>
                )}

                {isHovered && isReady && (
                    <button
                        onClick={handleMuteToggle}
                        className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-slate-200 hover:text-white p-1.5 rounded-lg transition-all hover:scale-105 focus:outline-none"
                    >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>

            {/* Title & Metadata Layout */}
            <div className="flex gap-3 p-3.5 xs:p-4 flex-1 min-w-0">
                <div className="relative shrink-0">
                    <img
                        src={video.ownerDetails?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.ownerDetails?.username}`}
                        alt="Channel profile"
                        className="w-8.5 h-8.5 xs:w-9 xs:h-9 rounded-full object-cover border border-slate-700 bg-slate-900"
                    />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                    <h3 className={`font-semibold text-xs xs:text-sm text-slate-100 leading-snug line-clamp-2 transition-colors ${isReady ? 'group-hover:text-indigo-400' : 'opacity-70'}`}>
                        {video.title}
                    </h3>

                    <p className="text-[11px] xs:text-xs text-slate-400 mt-1 hover:text-slate-200 transition-colors truncate font-medium">
                        {video.ownerDetails?.username || "Channel Name"}
                    </p>

                    <div className="flex items-center gap-1.5 mt-0.5 xs:mt-1 text-[10px] xs:text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 opacity-80" />
                            {video.views?.toLocaleString() || 0}
                        </span>
                        <span className="text-slate-700">•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 xs:w-3.5 xs:h-3.5 opacity-80" />
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
                // 💡 Controller ab aggregatePaginate direct bhejta h docs pipeline k sath
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
            <div className="w-full max-w-full min-h-screen pt-3 px-3.5 sm:px-6 pb-24 bg-slate-950 space-y-5 box-border overflow-hidden">
                <div className="flex space-x-2 overflow-hidden pb-2 border-b border-slate-900/40">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="h-7 w-16 bg-slate-900/60 border border-slate-800/30 rounded-xl shrink-0 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-5">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-3.5 animate-pulse">
                            <div className="aspect-video bg-slate-900/80 rounded-xl w-full" />
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-900/80 shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3.5 bg-slate-900/80 rounded w-5/6" />
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
        <div className="w-full max-w-full min-h-screen pt-3 px-3.5 sm:px-6 md:px-8 pb-24 bg-slate-950 text-slate-100 select-none relative z-10 box-border overflow-x-hidden">

            {/* Category Pills Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-900/40 w-full">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3.5 py-1 rounded-xl text-[11px] xs:text-xs font-semibold whitespace-nowrap transition-all duration-300 border active:scale-[0.96] ${activeFilter === filter
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
                <div className="w-full max-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-5 mt-4 sm:mt-5 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 box-border">
                    {videos.map((video) => (
                        <VideoCard
                            key={video._id}
                            video={video}
                            onClick={() => navigate(`/video/${video._id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-md mx-auto mt-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3.5 shadow-inner">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-semibold text-slate-200">No Premium Streams Found</h3>
                    <p className="text-[11px] text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                        Adjust your active category filter or check back later for high-performance HLS uploads.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Home;