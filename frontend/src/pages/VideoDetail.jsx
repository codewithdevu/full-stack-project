import React, { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import Hls from "hls.js";
import { ThumbsUp, Share2, MessageSquare, Trash2, Pencil, ListPlus, Play, Pause, Volume2, VolumeX, Maximize, Users, Clock, Compass, Sparkles, X, Heart, Video, Settings2, Cpu, RefreshCw } from "lucide-react";

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
    if (diffDays < 30) return `${diffDays}d ago`;

    return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDuration = (secs) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const VideoDetail = () => {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [comment, setComment] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState("");

    // RESOLUTION SELECTOR STATES
    const [resolutions, setResolutions] = useState([]);
    const [currentResIndex, setCurrentResIndex] = useState(-1);
    const [showResMenu, setShowResMenu] = useState(false);

    // CUSTOM CONTROLS LAYER STATES
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const hlsInstanceRef = useRef(null);
    const navigate = useNavigate();

    // Dynamic state detection helpers
    const isTranscoding = video?.status === "pending" || video?.status === "processing";
    const isFailed = video?.status === "failed";

    // CURRENT USER DETAILS LOG FETCH
    const fetchCurrentUser = async () => {
        try {
            const response = await apiClient.get("/users/current-user");
            if (response.data?.data) {
                setCurrentUser(response.data.data);
            }
        } catch (error) {
            console.log("User authentication node context deferred safely.");
        }
    };

    const fetchVideoDetail = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const videoResponse = await apiClient.get(`/videos/${videoId}`);

            if (videoResponse.data?.data) {
                setVideo(videoResponse.data.data);
            }

            const commentResponse = await apiClient.get(`/comments/${videoId}`);
            if (commentResponse.data?.data) {
                setComment(commentResponse.data.data.docs || commentResponse.data.data);
            }
        } catch (error) {
            console.error("Error fetching video details: ", error);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    // AUTOMATIC BACKGROUND POLLING HOOK
    useEffect(() => {
        if (!videoId) return;

        fetchCurrentUser();
        fetchVideoDetail(true);
        fetchRecommendations();

        const statusPollInterval = setInterval(() => {
            setVideo((currentVideoState) => {
                if (!currentVideoState || currentVideoState.status === "pending" || currentVideoState.status === "processing") {
                    console.log("Polling background pipeline active transcoder nodes...");
                    apiClient.get(`/videos/${videoId}`)
                        .then((res) => {
                            if (res.data?.data) {
                                setVideo(res.data.data);
                            }
                        })
                        .catch(err => console.error("Silent sync background fetch check dropped: ", err));
                }
                return currentVideoState;
            });
        }, 4000);

        return () => clearInterval(statusPollInterval);
    }, [videoId]);

    // ADAPTIVE HLS & MP4 LIFECYCLE HYDRATION ENGINE
    useEffect(() => {
        if (loading || !videoRef.current || !video || isTranscoding) return;

        const videoElement = videoRef.current;
        const isHlsStream = video.hlsMasterUrl && video.hlsMasterUrl.includes(".m3u8");
        const streamUrl = isHlsStream ? video.hlsMasterUrl : video.videoFile;

        if (streamUrl) {
            if (isHlsStream) {
                if (Hls.isSupported()) {
                    if (hlsInstanceRef.current) {
                        hlsInstanceRef.current.destroy();
                        hlsInstanceRef.current = null;
                    }

                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 30,
                        maxBufferLength: 10
                    });

                    hlsInstanceRef.current = hls;
                    hls.loadSource(streamUrl);
                    hls.attachMedia(videoElement);

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        const parsedLevels = hls.levels.map((level, idx) => ({
                            index: idx,
                            height: level.height,
                            bitrate: level.bitrate
                        })).reverse();

                        setResolutions(parsedLevels);
                        setCurrentResIndex(-1);
                        videoElement.play().catch((err) => console.log("Autoplay context bypass: ", err));
                    });

                    hls.on(Hls.Events.ERROR, (event, data) => {
                        if (data.fatal) {
                            switch (data.type) {
                                case Hls.ErrorTypes.NETWORK_ERROR:
                                    hls.startLoad();
                                    break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    hls.recoverMediaError();
                                    break;
                                default:
                                    if (hlsInstanceRef.current) {
                                        hlsInstanceRef.current.destroy();
                                        hlsInstanceRef.current = null;
                                    }
                                    break;
                            }
                        }
                    });
                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                    videoElement.src = streamUrl;
                }
            } else {
                if (hlsInstanceRef.current) {
                    hlsInstanceRef.current.destroy();
                    hlsInstanceRef.current = null;
                }

                videoElement.src = streamUrl;
                videoElement.load();
                setResolutions([]);
                setCurrentResIndex(-1);

                videoElement.play().catch((err) => console.log("Direct play request deferred: ", err));
            }
        }

        const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
        const handleDurationChange = () => setTotalDuration(videoElement.duration);
        const handlePlayState = () => setIsPlaying(true);
        const handlePauseState = () => setIsPlaying(false);

        videoElement.addEventListener("timeupdate", handleTimeUpdate);
        videoElement.addEventListener("durationchange", handleDurationChange);
        videoElement.addEventListener("play", handlePlayState);
        videoElement.addEventListener("pause", handlePauseState);

        return () => {
            videoElement.removeEventListener("timeupdate", handleTimeUpdate);
            videoElement.removeEventListener("durationchange", handleDurationChange);
            videoElement.removeEventListener("play", handlePlayState);
            videoElement.removeEventListener("pause", handlePauseState);
            if (hlsInstanceRef.current) {
                hlsInstanceRef.current.destroy();
                hlsInstanceRef.current = null;
            }
        };
    }, [video, loading, isTranscoding]);

    const togglePlay = () => {
        if (isTranscoding || !videoRef.current) return;
        if (isPlaying) videoRef.current.pause();
        else videoRef.current.play().catch(e => console.log(e));
    };

    const handleTimelineChange = (e) => {
        if (!videoRef.current) return;
        const targetTime = parseFloat(e.target.value);
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
    };

    const handleVolumeSlider = (e) => {
        if (!videoRef.current) return;
        const targetVol = parseFloat(e.target.value);
        videoRef.current.volume = targetVol;
        setVolume(targetVol);
        setIsMuted(targetVol === 0);
        videoRef.current.muted = targetVol === 0;
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const currentMuteState = !isMuted;
        setIsMuted(currentMuteState);
        videoRef.current.muted = currentMuteState;
        if (!currentMuteState && volume === 0) {
            setVolume(0.5);
            videoRef.current.volume = 0.5;
        }
    };

    const toggleFullScreen = () => {
        if (!playerContainerRef.current) return;
        if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    };

    const changeResolution = (levelIndex) => {
        if (!hlsInstanceRef.current) return;
        hlsInstanceRef.current.currentLevel = levelIndex;
        setCurrentResIndex(levelIndex);
        setShowResMenu(false);
    };

    const openPlaylistModal = async () => {
        try {
            if (!currentUser || !currentUser?._id) {
                alert("Please log in to save videos to a playlist.");
                return;
            }
            setShowPlaylistModal(true);
            const response = await apiClient.get(`playlist/user/${currentUser._id}`);
            setUserPlaylists(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching user playlists: ", error);
        }
    };

    const addVideoToPlaylist = async (playlistId) => {
        try {
            await apiClient.patch(`/playlist/add/${videoId}/${playlistId}`);
            alert("Video added to playlist successfully!");
            setShowPlaylistModal(false);
        } catch (error) {
            console.error("Error adding video to playlist: ", error);
        }
    };

    const handleLike = async () => {
        try {
            await apiClient.post(`/likes/toggle/v/${videoId}`);
            setVideo((prev) => ({
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
            }));
        } catch (error) {
            console.error("Error liking video: ", error);
        }
    };

    const handleToggleCommentLike = async (commentId) => {
        try {
            setComment((prevComments) =>
                prevComments.map((c) => {
                    if (c._id === commentId) {
                        const currentlyLiked = c.isLiked;
                        return {
                            ...c,
                            isLiked: !currentlyLiked,
                            likesCount: currentlyLiked ? (c.likesCount || 1) - 1 : (c.likesCount || 0) + 1
                        };
                    }
                    return c;
                })
            );
            await apiClient.post(`/likes/toggle/c/${commentId}`);
        } catch (error) {
            console.error("Error toggling comment like:", error);
        }
    };

    const toggleSubscribe = async () => {
        try {
            await apiClient.post(`/subscriptions/u/${video.owner?._id}`);
            setVideo((prev) => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                subscribersCount: prev.isSubscribed ? prev.subscribersCount - 1 : prev.subscribersCount + 1
            }));
        } catch (error) {
            console.error("Subscription failed:", error);
        }
    };

    const postComment = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await apiClient.post(`/comments/${videoId}`, { content: newComment });
            if (response.data?.data) {
                const standardCommentNode = {
                    ...response.data.data,
                    owner: {
                        _id: currentUser?._id,
                        username: currentUser?.username,
                        avatar: currentUser?.avatar
                    }
                };
                setComment([standardCommentNode, ...comment]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Error posting comment: ", error);
        }
    };

    const startEditing = (cNode) => {
        setEditingCommentId(cNode._id);
        setEditedContent(cNode.content);
    };

    const saveEdit = async (commentId) => {
        if (!editedContent.trim()) return;
        try {
            const response = await apiClient.patch(`/comments/c/${commentId}`, { content: editedContent });
            if (response.data?.data) {
                setComment(prev => prev.map(c => c._id === commentId ? { ...c, content: editedContent } : c));
                setEditingCommentId(null);
                setEditedContent("");
            }
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    const deleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await apiClient.delete(`/comments/c/${commentId}`);
            setComment(comment.filter(c => c._id !== commentId));
            alert("Comment deleted successfully");
        } catch (error) {
            console.error("Error deleting comment: ", error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await apiClient.get("/videos");
            if (response.data?.data?.docs) {
                const processedRecs = response.data.data.docs.filter(v =>
                    v._id !== videoId && (!v.status || v.status === "processed")
                );
                setRecommendations(processedRecs);
            }
        } catch (error) {
            console.error("Error fetching recommendations: ", error);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/85 flex items-center justify-center text-indigo-400 animate-spin">
                        <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">Synchronizing cinema stream...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-3.5 md:p-8 pb-24 lg:pb-12 select-none relative overflow-x-hidden font-sans selection:bg-indigo-500/30">

            <div className="absolute top-0 right-1/4 w-72 h-72 sm:w-100 sm:h-100 bg-indigo-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-100 bg-purple-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 relative z-10 w-full box-border">

                {/* LEFT COLUMN: Video Player & Meta & Comments */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-5 min-w-0 w-full">

                    {/* PLAYER BOX */}
                    <div
                        ref={playerContainerRef}
                        className="aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-900 w-full box-border relative group/player cursor-pointer"
                        onClick={togglePlay}
                    >
                        {isTranscoding ? (
                            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center gap-4 animate-in fade-in duration-300">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-16 h-16 rounded-full border border-dashed border-indigo-500/40 border-t-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />
                                    <div className="absolute w-12 h-12 rounded-full border border-indigo-500/20 border-t-purple-500 animate-spin duration-700" />
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-inner">
                                        <Cpu className="w-4 h-4 animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        {video.status === "pending" ? "Queue Pipeline Waiting" : "Compiling Adaptive Bitrates"}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        {video.status === "pending"
                                            ? "Video asset successfully caught in database queue nodes. Waiting for backend transcoder worker allotment..."
                                            : "FFmpeg is demuxing adaptive bitrates streams (1080p, 720p, 480p) and generating HLS master chunks playlist files to AWS S3 cluster storage."
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : isFailed ? (
                            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center gap-3 animate-in fade-in duration-300">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
                                    <X className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">HLS Compilation Aborted</h3>
                                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                                        The worker instance nodes dropped the video rendering packet pipeline due to an internal encoding codec crash.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    poster={isPlaying ? "" : video.thumbnail}
                                    className="w-full h-full object-contain pointer-events-none"
                                    playsInline
                                />

                                {/* PREMIUM OVERLAY CONTROL SHEET BAR */}
                                <div
                                    className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/95 via-slate-950/75 to-transparent px-4 pt-10 pb-4 flex flex-col gap-3 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 z-30 select-none pointer-events-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="w-full flex items-center group/slider relative">
                                        <input
                                            type="range"
                                            min={0}
                                            max={totalDuration || 0}
                                            value={currentTime}
                                            onChange={handleTimelineChange}
                                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-1.5 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-4">
                                            <button onClick={togglePlay} className="text-slate-300 hover:text-white transition-colors active:scale-95 outline-none">
                                                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                            </button>

                                            <div className="flex items-center gap-1.5 group/vol max-w-fit">
                                                <button onClick={toggleMute} className="text-slate-300 hover:text-white transition-colors active:scale-95 outline-none">
                                                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                                </button>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={1}
                                                    step={0.05}
                                                    value={isMuted ? 0 : volume}
                                                    onChange={handleVolumeSlider}
                                                    className="w-0 opacity-0 group-hover/vol:w-16 group-hover/vol:opacity-100 h-1 bg-slate-800 appearance-none rounded cursor-pointer accent-indigo-500 transition-all outline-none"
                                                />
                                            </div>

                                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold font-mono tracking-wide">
                                                {formatDuration(currentTime)} / {formatDuration(totalDuration)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 relative">
                                            {resolutions.length > 0 && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowResMenu(!showResMenu)}
                                                        className="px-2 py-0.5 bg-slate-900/80 border border-slate-800 rounded-md text-slate-400 hover:text-indigo-400 font-bold font-mono text-[10px] tracking-wider transition-colors outline-none flex items-center gap-1"
                                                    >
                                                        <Settings2 className="w-3 h-3" />
                                                        {currentResIndex === -1 ? "AUTO" : `${resolutions.find(r => r.index === currentResIndex)?.height}p`}
                                                    </button>

                                                    {showResMenu && (
                                                        <div className="absolute bottom-full right-0 mb-2 w-24 bg-slate-950 border border-slate-900 rounded-xl shadow-2xl p-1 flex flex-col gap-0.5 z-40">
                                                            <button
                                                                onClick={() => changeResolution(-1)}
                                                                className={`w-full text-left px-2 py-1 rounded-md text-[10px] font-bold font-mono ${currentResIndex === -1 ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/10" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
                                                            >
                                                                Auto
                                                            </button>
                                                            {resolutions.map((res) => (
                                                                <button
                                                                    key={res.index}
                                                                    onClick={() => changeResolution(res.index)}
                                                                    className={`w-full text-left px-2 py-1 rounded-md text-[10px] font-bold font-mono ${currentResIndex === res.index ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/10" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
                                                                >
                                                                    {res.height}p
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button onClick={toggleFullScreen} className="text-slate-300 hover:text-white transition-colors active:scale-95 outline-none">
                                                <Maximize className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Video Titles */}
                    <div className="space-y-3 w-full">
                        <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-slate-100 leading-snug px-0.5 wrap-break-word">
                            {video?.title}
                        </h1>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-slate-900 gap-3.5 w-full">
                            <span className="text-slate-500 text-[11px] md:text-xs font-semibold px-0.5 font-mono shrink-0">
                                {video?.views?.toLocaleString() || 0} views • {video && new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>

                            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 w-full sm:w-auto shrink-0 box-border">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 shrink-0 border ${video?.isLiked
                                        ? "bg-linear-to-r from-indigo-500/10 to-transparent border-indigo-500/30 text-indigo-300 shadow-md"
                                        : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                        }`}
                                >
                                    <ThumbsUp className={`w-3.5 h-3.5 ${video?.isLiked ? "fill-indigo-400/30" : ""}`} />
                                    <span>{video?.likesCount || 0}</span>
                                </button>

                                <button className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 transition-all duration-300 shrink-0">
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>Share</span>
                                </button>

                                <button
                                    onClick={openPlaylistModal}
                                    className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 transition-all duration-300 shrink-0"
                                >
                                    <ListPlus className="w-3.5 h-3.5" />
                                    <span>Save</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* OWNER BOX */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/20 backdrop-blur-md border border-slate-900/80 gap-3 w-full box-border">
                        <div className="flex items-center gap-2.5 cursor-pointer group min-w-0" onClick={() => video?.owner?.username && navigate(`/c/${video.owner.username}`)}>
                            <div className="relative shrink-0">
                                <img src={video?.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video?.owner?.username}`} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-800" alt="avatar" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-xs sm:text-sm text-slate-100 truncate group-hover:text-indigo-400 transition-colors">{video?.owner?.fullName || "Channel Name"}</h3>
                                <p className="text-slate-500 text-[10px] sm:text-[11px] truncate mt-0.5">
                                    @{video?.owner?.username || "creator"} • {video?.subscribersCount || 0} Subs
                                </p>
                            </div>
                        </div>

                        {/* 🛠️ SELF-SUBSCRIBE PROTECTION FILTER:
                           Agar logged-in user hi video ka real owner hai, toh 'Subscribe' ki jagah 'Your Video' badge dikhega.
                        */}
                        {currentUser?._id === video?.owner?._id ? (
                            <span className="px-4 py-2 rounded-xl text-[11px] xs:text-xs font-bold bg-slate-900/60 border border-slate-800/80 text-indigo-400 font-mono tracking-wide shrink-0">
                                Your Video
                            </span>
                        ) : (
                            <button
                                onClick={toggleSubscribe}
                                className={`px-3.5 py-2 rounded-xl text-[11px] xs:text-xs font-bold transition-all duration-300 active:scale-[0.98] shrink-0 border ${video?.isSubscribed
                                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                    : "bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white border-transparent shadow-lg shadow-indigo-500/10"
                                    }`}
                            >
                                {video?.isSubscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        )}
                    </div>

                    {/* Description Box */}
                    <div className="p-3.5 bg-slate-950/40 rounded-xl text-slate-400 text-xs leading-relaxed border border-slate-900/80 whitespace-pre-wrap font-medium wrap-break-word w-full box-border">
                        {video?.description || "No description provided."}
                    </div>

                    {/* Comments Layout */}
                    <div className="pt-3 space-y-5 w-full box-border">
                        <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2 pl-0.5">
                            <MessageSquare className="w-4 h-4 text-indigo-400" /> {comment.length} Discussion Logs
                        </h2>

                        <div className="flex gap-2.5 items-center bg-slate-950/20 border-b border-slate-900 focus-within:border-indigo-500/50 pb-2 transition duration-300 w-full">
                            <input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a public comment..."
                                className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 py-1 text-xs text-slate-200 placeholder-slate-600 font-medium min-w-0"
                            />
                            <button onClick={postComment} className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-300 transition shrink-0">Comment</button>
                        </div>

                        {/* COMMENT ITEMS LOOP */}
                        <div className="space-y-3 w-full box-border">
                            {comment.map((c) => {
                                if (!c) return null;
                                const isCommentOwner = c.owner?._id === currentUser?._id;
                                const isEditingThisComment = editingCommentId === c._id;

                                return (
                                    <div key={c._id} className="group flex gap-3.5 relative items-start bg-slate-900/10 hover:bg-slate-900/20 p-3 rounded-2xl border border-transparent hover:border-slate-900/50 transition duration-300 w-full box-border overflow-hidden">
                                        <img
                                            src={c.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.owner?.username || "user"}`}
                                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-900"
                                            alt="avatar"
                                        />

                                        <div className="flex-1 min-w-0 w-full pr-6 md:pr-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-xs text-indigo-400 truncate max-w-30 xs:max-w-none">@{c.owner?.username || "user"}</span>
                                                <span className="text-[9px] text-slate-600 font-mono shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {/* Dynamic Edit Input Block */}
                                            {isEditingThisComment ? (
                                                <div className="mt-2 space-y-2 w-full animate-in fade-in duration-200">
                                                    <textarea
                                                        value={editedContent}
                                                        onChange={(e) => setEditedContent(e.target.value)}
                                                        rows={2}
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none box-border"
                                                    />
                                                    <div className="flex gap-2 justify-end pt-0.5">
                                                        <button
                                                            onClick={() => { setEditingCommentId(null); setEditedContent(""); }}
                                                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => saveEdit(c._id)}
                                                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-md"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs mt-1.5 text-slate-300 leading-relaxed font-medium wrap-break-word pr-2">
                                                    {c.content}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 mt-2.5 pt-1.5 border-t border-slate-900/40">
                                                <button
                                                    onClick={() => handleToggleCommentLike(c._id)}
                                                    className={`flex items-center gap-1 text-[10px] font-bold transition-all group ${c.isLiked ? "text-rose-500" : "text-slate-500 hover:text-rose-400"}`}
                                                >
                                                    <Heart className="w-3 h-3 transition-transform" fill={c.isLiked ? "currentColor" : "none"} />
                                                    <span className="text-slate-400 font-mono">{c.likesCount || 0}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* 🛠️ ACTION CHIPS OVERLAP PROTECTION */}
                                        {isCommentOwner && !isEditingThisComment && (
                                            <div className="flex gap-1 absolute right-2 top-2 bg-slate-950 border border-slate-900 rounded-lg p-1 shadow-md shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(c)}
                                                    className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"
                                                    title="Edit Comment"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteComment(c._id)}
                                                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                                    title="Delete Comment"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Video Recommendations Shelf */}
                <div className="lg:col-span-1 space-y-3.5 w-full box-border min-w-0 mt-2 lg:mt-0">
                    <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1 pl-0.5">Next Recommendations</h3>

                    <div className="space-y-3 w-full box-border">
                        {recommendations.length > 0 ? (
                            recommendations.map((rec) => (
                                <div
                                    key={rec._id}
                                    onClick={() => navigate(`/video/${rec._id}`)}
                                    className="flex gap-3 cursor-pointer bg-slate-900/15 hover:bg-slate-900/30 p-2 rounded-xl border border-transparent hover:border-indigo-500/10 transition duration-300 group shadow-sm w-full box-border min-w-0"
                                >
                                    <div className="relative w-28 xs:w-32 aspect-video shrink-0 rounded-lg overflow-hidden border border-slate-900 bg-slate-950">
                                        <img src={rec.thumbnail} className="w-full h-full object-cover" alt="Suggested stream thumb" />
                                    </div>
                                    <div className="flex flex-col min-w-0 justify-center flex-1 pr-1">
                                        <h4 className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors wrap-break-word">{rec.title}</h4>
                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">@{rec.ownerDetails?.username || rec.owner?.username || "creator"}</p>
                                        <p className="text-[9px] text-slate-600 mt-0.5 font-mono">{rec.views?.toLocaleString() || 0} views</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-16 rounded-xl border border-dashed border-slate-950/10 text-slate-500 w-full">
                                <Compass className="w-5 h-5 text-slate-700 mb-2" />
                                <p className="text-[10px] font-semibold text-slate-400">Suggestions complete</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PLAYLIST MODAL FRAME */}
            {showPlaylistModal && (
                <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-3 xs:p-4 backdrop-blur-md">
                    <div className="bg-slate-950 border border-slate-800/80 w-full max-w-md rounded-2xl p-5 xs:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 box-border overflow-hidden">
                        <button onClick={() => setShowPlaylistModal(false)} className="absolute right-4 top-4 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all"><X className="w-4 h-4" /></button>
                        <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase mb-5 flex items-center gap-2.5"><ListPlus className="w-4 h-4 text-indigo-400" /> Save to Archive</h2>
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 [scrollbar-width:thin]">
                            {userPlaylists.length > 0 ? (
                                userPlaylists.map(pl => (
                                    <div
                                        key={pl._id}
                                        onClick={() => addVideoToPlaylist(pl._id)}
                                        className="p-3 bg-slate-900/30 rounded-xl border border-slate-900 hover:bg-indigo-600/15 hover:border-indigo-500/30 text-xs transition cursor-pointer flex justify-between items-center group duration-300 w-full box-border"
                                    >
                                        <span className="font-semibold text-slate-300 group-hover:text-indigo-200 truncate pr-2">{pl.name}</span>
                                        <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-mono shrink-0">{pl.videos?.length || 0} streams</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-600 py-6 italic text-xs">No active collections found.</p>
                            )}
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-900 flex justify-end">
                            <button onClick={() => setShowPlaylistModal(false)} className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoDetail;