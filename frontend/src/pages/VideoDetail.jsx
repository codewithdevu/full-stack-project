import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig.js";
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, Share2, MessageSquare, Trash2, Pencil, ListPlus, Play, Users, Clock, Compass, Sparkles, X, Heart } from "lucide-react";

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
    const navigate = useNavigate();

    const fetchVideoDetail = async () => {
        try {
            setLoading(true)
            const videoResponse = await apiClient.get(`/videos/${videoId}`);

            console.log("video data: ", videoResponse);

            if (videoResponse.data?.data) {
                setVideo(videoResponse.data.data);
            }

            const commentResponse = await apiClient.get(`/comments/${videoId}`)

            if (commentResponse.data?.data) {
                setComment(commentResponse.data.data.docs || commentResponse.data.data);
            }
        } catch (error) {
            console.error("Error: fetching video details: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (videoId) {
            fetchVideoDetail();
            fetchRecommendations();
        }
    }, [videoId]);

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
            console.error("Error: fetching user playlists: ", error);
        }
    };

    const addVideoToPlaylist = async (playlistId) => {
        try {
            const response = await apiClient.patch(`/playlist/add/${videoId}/${playlistId}`);
            alert("Video added to playlist successfully!");
            setShowPlaylistModal(false);
        } catch (error) {
            console.error("Error: adding video to playlist: ", error);
        }
    };

    const handleLike = async () => {
        try {
            const response = await apiClient.post(`/likes/toggle/v/${videoId}`);

            setVideo((prev) => ({
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
            }));

        } catch (error) {
            console.error("Error: liking video: ", error);
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
            const commentResponse = await apiClient.get(`/comments/${videoId}`);
            if (commentResponse.data?.data) {
                setComment(commentResponse.data.data.docs || commentResponse.data.data);
            }
        }
    };

    const toggleSubscribe = async () => {
        try {
            await apiClient.post(`/subscriptions/u/${video.owner?._id}`);

            setVideo((prev) => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                subscribersCount: prev.isSubscribed
                    ? prev.subscribersCount - 1
                    : prev.subscribersCount + 1
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
                setComment([response.data.data, ...comment]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Error: posting comment: ", error);
        }
    }

    const startEditing = (comment) => {
        setEditingCommentId(comment._id);
        setEditedContent(comment.content);
    };

    const saveEdit = async (commentId) => {
        if (!editedContent.trim()) return;

        try {
            const response = await apiClient.patch(
                `/comments/c/${commentId}`,
                { content: editedContent }
            );

            if (response.data?.data) {
                setComment(prev =>
                    prev.map(c =>
                        c._id === commentId
                            ? { ...c, content: editedContent }
                            : c
                    )
                );

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
            console.error("Error: deleting comment: ", error);
            alert("Failed to delete comment");
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await apiClient.get("/videos");
            if (response.data?.data?.docs) {
                const filteredVideos = response.data.data.docs.filter(v => v._id !== videoId);
                setRecommendations(filteredVideos);
            }
        } catch (error) {
            console.error("Error: fetching recommendations: ", error);
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await apiClient.get("/users/current-user");
                setCurrentUser(response.data.data);
            } catch (error) {
                console.log("Not logged in");
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const addToHistory = async () => {
            try {
                await apiClient.post(`/users/history/${videoId}`);
            } catch (error) {
                console.error("Error: adding to history: ", error);
            }
        };
        if (videoId) {
            addToHistory();
        }
    }, [videoId]);

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

    if (!video) {
        return (
            <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-rose-400">
                        <Video className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">Video Offline</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        This video resource is offline or has been removed from velocity HLS transcoders.
                    </p>
                </div>
            </div>
        );
    }

    return (
        // Added standard pt-20 navbar offset alignment layer and overflow protection configurations
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-3.5 md:p-8 pb-24 lg:pb-12 select-none relative overflow-x-hidden font-sans selection:bg-indigo-500/30">

            {/* Ambient Background Spotlights */}
            <div className="absolute top-0 right-1/4 w-72 h-72 sm:w-100 sm:h-100 bg-indigo-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-100 bg-purple-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 relative z-10 w-full box-border">

                {/* LEFT COLUMN: Video Player & Meta & Comments */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-5 min-w-0 w-full">

                    {/* Cinema Bezel Player Frame */}
                    {/* Fixed edge spacing leakage parameter triggers for 375px screens */}
                    <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-900 w-full box-border">
                        <video src={video.videoFile} controls poster={video.thumbnail} className="w-full h-full object-contain" autoPlay />
                    </div>

                    {/* Video Titles */}
                    <div className="space-y-3 w-full">
                        <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-slate-100 leading-snug px-0.5 wrap-break-word">
                            {video.title}
                        </h1>

                        {/* Views count and Actions Separator Row */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-slate-900 gap-3.5 w-full">
                            <span className="text-slate-500 text-[11px] md:text-xs font-semibold px-0.5 font-mono shrink-0">
                                {video.views?.toLocaleString()} views • {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>

                            {/* Action Buttons Row */}
                            {/* Hidden native browser horizontal layout track bars perfectly */}
                            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 w-full sm:w-auto shrink-0 box-border">
                                {/* Like Action */}
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 shrink-0 border ${video.isLiked
                                        ? "bg-linear-to-r from-indigo-500/10 to-transparent border-indigo-500/30 text-indigo-300 shadow-md"
                                        : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                        }`}
                                >
                                    <ThumbsUp className={`w-3.5 h-3.5 ${video.isLiked ? "fill-indigo-400/30" : ""}`} />
                                    <span>{video.likesCount || 0}</span>
                                </button>

                                {/* Share Action */}
                                <button className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 transition-all duration-300 shrink-0">
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>Share</span>
                                </button>

                                {/* Save/Playlist Action */}
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

                    {/* OWNER BOX: Responsive realignment */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/20 backdrop-blur-md border border-slate-900/80 gap-3 w-full box-border">
                        <div className="flex items-center gap-2.5 cursor-pointer group min-w-0" onClick={() => navigate(`/c/${video.owner?.username}`)}>
                            <div className="relative shrink-0">
                                <img src={video.owner?.avatar} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-800" alt="avatar" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-xs sm:text-sm text-slate-100 truncate group-hover:text-indigo-400 transition-colors">{video.owner?.fullName}</h3>
                                <p className="text-slate-500 text-[10px] sm:text-[11px] truncate mt-0.5">
                                    @{video.owner?.username} • {video.subscribersCount || 0} Subs
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleSubscribe}
                            className={`px-3.5 py-2 rounded-xl text-[11px] xs:text-xs font-bold transition-all duration-300 active:scale-[0.98] shrink-0 border ${video.isSubscribed
                                ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                : "bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white border-transparent shadow-lg shadow-indigo-500/10"
                                }`}
                        >
                            {video.isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>

                    {/* Description Box */}
                    <div className="p-3.5 bg-slate-950/40 rounded-xl text-slate-400 text-xs leading-relaxed border border-slate-900/80 whitespace-pre-wrap font-medium wrap-break-word w-full box-border">
                        {video.description || "No description provided."}
                    </div>

                    {/* Comments Layout */}
                    <div className="pt-3 space-y-5 w-full box-border">
                        <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2 pl-0.5">
                            <MessageSquare className="w-4 h-4 text-indigo-400" /> {comment.length} Discussion Logs
                        </h2>

                        {/* Input Box */}
                        <div className="flex gap-2.5 items-center bg-slate-950/20 border-b border-slate-900 focus-within:border-indigo-500/50 pb-2 transition duration-300 w-full">
                            <input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a public comment..."
                                className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 py-1 text-xs text-slate-200 placeholder-slate-600 font-medium min-w-0"
                            />
                            <button onClick={postComment} className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-300 transition shrink-0">Comment</button>
                        </div>

                        {/* Comments List Shelf */}
                        <div className="space-y-3 w-full box-border">
                            {comment.map((c) => (
                                <div key={c._id} className="flex gap-3 group relative items-start bg-slate-900/10 hover:bg-slate-900/20 p-3 rounded-2xl border border-transparent hover:border-slate-900/50 transition duration-300 w-full box-border overflow-hidden">
                                    <img src={c.owner?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback"} className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-900" alt="avatar" />

                                    <div className="flex-1 min-w-0 w-full pr-6 md:pr-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-xs text-indigo-400 truncate max-w-30 xs:max-w-none">@{c.owner?.username}</span>
                                            <span className="text-[9px] text-slate-600 font-mono shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {editingCommentId === c._id ? (
                                            <div className="mt-2 space-y-2 w-full">
                                                <textarea
                                                    value={editedContent}
                                                    onChange={(e) => setEditedContent(e.target.value)}
                                                    rows={2}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none"
                                                />
                                                <div className="flex gap-1.5 justify-end">
                                                    <button onClick={() => saveEdit(c._id)} className="px-2.5 py-1 rounded-lg bg-indigo-500 text-white text-[10px] font-semibold">Save</button>
                                                    <button onClick={() => { setEditingCommentId(null); setEditedContent(""); }} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-semibold">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs mt-1 text-slate-300 leading-relaxed font-medium wrap-break-word pr-2">
                                                {c.content}
                                            </p>
                                        )}

                                        {/* Comment Actions Like */}
                                        <div className="flex items-center gap-4 mt-2 pt-1.5 border-t border-slate-900/40">
                                            <button
                                                onClick={() => handleToggleCommentLike(c._id)}
                                                className={`flex items-center gap-1 text-[10px] font-bold transition-all group ${c.isLiked ? "text-rose-500" : "text-slate-500 hover:text-rose-400"}`}
                                            >
                                                <Heart className="w-3 h-3 transition-transform" fill={c.isLiked ? "currentColor" : "none"} />
                                                <span className="text-slate-400 font-mono">{c.likesCount || 0}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit / Delete Layer - Clean configuration mapping for 375px hits */}
                                    {c.owner?._id === currentUser?._id && (
                                        <div className="flex gap-1 absolute right-2 top-2 bg-slate-950 border border-slate-900 rounded-lg p-1 shadow-md shrink-0">
                                            <button type="button" onClick={() => startEditing(c)} className="p-1 text-slate-500 hover:text-indigo-400"><Pencil className="w-3 h-3" /></button>
                                            <button type="button" onClick={() => deleteComment(c._id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
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
                                    {/* Thumbnail adaptive limits */}
                                    <div className="relative w-28 xs:w-32 aspect-video shrink-0 rounded-lg overflow-hidden border border-slate-900 bg-slate-950">
                                        <img src={rec.thumbnail} className="w-full h-full object-cover" alt="Suggested stream thumb" />
                                    </div>
                                    <div className="flex flex-col min-w-0 justify-center flex-1 pr-1">
                                        <h4 className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors wrap-break-word">{rec.title}</h4>
                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">@{rec.ownerDetails?.username || "creator"}</p>
                                        <p className="text-[9px] text-slate-600 mt-0.5 font-mono">{rec.views?.toLocaleString()} views</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-16 rounded-xl border border-dashed border-slate-900 bg-slate-950/10 text-slate-500 w-full">
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

                        <button
                            onClick={() => setShowPlaylistModal(false)}
                            className="absolute right-4 top-4 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-xs sm:text-sm font-bold text-slate-100 tracking-wider uppercase mb-5 flex items-center gap-2">
                            <ListPlus className="w-4 h-4 text-indigo-400" /> Save to Archive
                        </h2>

                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 [scrollbar-width:thin]">
                            {userPlaylists.length > 0 ? (
                                userPlaylists.map(pl => (
                                    <div
                                        pl-id={pl._id}
                                        key={pl._id}
                                        onClick={() => addVideoToPlaylist(pl._id)}
                                        className="p-3 bg-slate-900/30 rounded-xl border border-slate-900 hover:bg-indigo-600/15 hover:border-indigo-500/30 text-xs transition cursor-pointer flex justify-between items-center group duration-300 w-full box-border"
                                    >
                                        <span className="font-semibold text-slate-300 group-hover:text-indigo-200 truncate pr-2">{pl.name}</span>
                                        <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-mono shrink-0">
                                            {pl.videos?.length || 0} streams
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-600 py-6 italic text-xs">No active collections found.</p>
                            )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-900 flex justify-end">
                            <button
                                onClick={() => setShowPlaylistModal(false)}
                                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoDetail;