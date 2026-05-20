import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig.js";
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, Share2, MessageSquare, Trash2, Pencil, ListPlus, ThumbsUpIcon } from "lucide-react";




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
            
            // console.log("commentResponse",commentResponse.data?.data);
            
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

            fetchComments();
        }
    };

    const toggleSubscribe = async () => {
        try {
            // Backend hit: /subscriptions/c/:channelId
            await apiClient.post(`/subscriptions/u/${video.owner?._id}`);

            // UI turant update karo
            setVideo((prev) => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                // Agar subscribe kiya toh count badhao, varna kam karo
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

            // response.data.data mein tera 'populatedComment' object hoga
            if (response.data?.data) {
                // Naya comment list mein sabse upar dalo
                setComment([response.data.data, ...comment]);
                setNewComment(""); // Input khali kar do
            }
        } catch (error) {
            console.error("Error: posting comment: ", error);
        }
    }

    const editComment = async (commentId, oldContent) => {
        const newContent = window.prompt("Edit your comment:", oldContent);

        if (!newContent || newContent.trim() === "" || newContent === oldContent) return;

        try {
            const response = await apiClient.patch(`/comments/c/${commentId}`, { content: newContent });

            if (response.data?.data) {
                setComment(comment.map(c => c._id === commentId ? { ...c, content: newContent } : c));
            }
        } catch (error) {
            console.error("Error: editing comment: ", error);
        };
    }

    const deleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await apiClient.delete(`/comments/c/${commentId}`);

            //UI se us comment ko hata do
            setComment(comment.filter(c => c._id !== commentId));
            alert("Comment deleted successfully");
        } catch (error) {
            console.error("Error: deleting comment: ", error);
            alert("Failed to delete comment");
        };
    }

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
        return <div className="text-white text-center mt-20">Loading Video...</div>;
    }
    if (!video) {
        return <div className="text-white text-center mt-20">Video not found!</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-2 md:p-8 pb-24 lg:pb-8 select-none">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                {/* LEFT COLUMN: Video Player & Meta & Comments */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Video Box Frame */}
                    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-800/60 -mx-2 sm:mx-0">
                        <video src={video.videoFile} controls poster={video.thumbnail} className="w-full h-full" autoPlay />
                    </div>

                    {/* Video Titles */}
                    <div className="pt-1">
                        <h1 className="text-lg md:text-2xl font-bold tracking-tight text-slate-100 px-1 leading-snug">{video.title}</h1>

                        {/* Views count and Actions Separator Row */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 pb-4 border-b border-slate-800 gap-3">
                            <span className="text-slate-400 text-xs md:text-sm px-1">
                                {video.views?.toLocaleString()} views • {new Date(video.createdAt).toLocaleDateString()}
                            </span>

                            {/* 🟢 ACTION BUTTONS ROW: Horizontal Swipe for Mobiles (375px fix) */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 -mx-2 sm:mx-0 shrink-0">
                                {/* Like Button */}
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${video.isLiked
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                >
                                    <ThumbsUp size={14} fill={video.isLiked ? "white" : "none"} className={video.isLiked ? "animate-bounce" : ""} />
                                    <span>{video.likesCount || 0}</span>
                                </button>

                                {/* Share Button */}
                                <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-bold text-slate-300 transition shrink-0">
                                    <Share2 size={14} />
                                    <span>Share</span>
                                </button>

                                {/* Save Button */}
                                <button
                                    onClick={openPlaylistModal}
                                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-bold text-slate-300 transition shrink-0"
                                >
                                    <ListPlus size={14} />
                                    <span>Save</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 🟢 OWNER BOX: Responsive realignment */}
                    <div className="flex items-center justify-between p-3 md:p-4 bg-slate-800/40 rounded-2xl border border-slate-800/60 gap-3">
                        <div className="flex items-center gap-3 cursor-pointer group min-w-0" onClick={() => navigate(`/c/${video.owner?.username}`)}>
                            <img src={video.owner?.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-blue-500/50 shrink-0" alt="avatar" />
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm md:text-base text-slate-200 truncate">{video.owner?.fullName}</h3>
                                <p className="text-slate-400 text-[10px] md:text-xs truncate">
                                    @{video.owner?.username} • {video.subscribersCount || 0} Subscriber
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleSubscribe}
                            className={`px-4 md:px-6 py-2 rounded-xl md:rounded-full text-xs md:text-sm font-extrabold transition-all duration-200 active:scale-[0.98] shrink-0 ${video.isSubscribed
                                    ? "bg-slate-800 text-slate-400 border border-slate-700"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {video.isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>

                    {/* Description Box */}
                    <div className="p-3 bg-slate-800/20 rounded-xl text-slate-300 text-xs md:text-sm whitespace-pre-wrap leading-relaxed border border-slate-800/30">
                        {video.description || "No description provided."}
                    </div>

                    {/* Comments Layout */}
                    <div className="pt-4">
                        <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <MessageSquare size={18} className="text-blue-500" /> {comment.length} Comments
                        </h2>

                        {/* Input Box */}
                        <div className="flex gap-3 mb-6 items-end">
                            <input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a public comment..."
                                className="flex-1 bg-transparent border-b border-slate-800 focus:border-blue-500 outline-none py-1.5 text-sm transition"
                            />
                            <button onClick={postComment} className="bg-blue-600 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition">Post</button>
                        </div>

                        {/* Comments List Shelf */}
                        <div className="space-y-4">
                            {comment.map((c) => (
                                <div key={c._id} className="flex gap-3 group relative items-start bg-slate-800/10 p-2.5 rounded-xl border border-transparent hover:border-slate-800/40 transition">
                                    <img src={c.owner?.avatar || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-800" alt="avatar" />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-xs text-blue-400 truncate max-w-30">@{c.owner?.username}</span>
                                            <span className="text-[9px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs md:text-sm mt-1 text-slate-200 pr-8 leading-normal">{c.content}</p>

                                        {/* Comment Actions Like */}
                                        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-800/30">
                                            <button
                                                onClick={() => handleToggleCommentLike(c._id)}
                                                className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 ${c.isLiked ? "text-red-500" : "text-slate-500 hover:text-red-400"}`}
                                            >
                                                <ThumbsUpIcon size={12} fill={c.isLiked ? "currentColor" : "none"} />
                                                <span>{c.likesCount || 0}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit / Delete Layer */}
                                    {c.owner?._id === currentUser?._id && (
                                        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-slate-900/90 md:bg-slate-900/80 rounded px-1.5 py-0.5 shadow-md">
                                            <button
                                                type="button"
                                                onClick={() => editComment(c._id, c.content)}
                                                className="p-1 text-slate-400 hover:text-blue-400 active:scale-90 transition-transform"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteComment(c._id)}
                                                className="p-1 text-slate-400 hover:text-red-400 active:scale-90 transition-transform"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Video Recommendations Shelf */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-sm md:text-base text-slate-200 mb-2 tracking-wide uppercase">Next Videos</h3>

                    <div className="space-y-3">
                        {recommendations.length > 0 ? (
                            recommendations.map((rec) => (
                                <div
                                    key={rec._id}
                                    onClick={() => navigate(`/video/${rec._id}`)}
                                    className="flex gap-3 cursor-pointer bg-slate-800/10 hover:bg-slate-800/30 p-1.5 rounded-xl border border-transparent hover:border-slate-800/40 transition group"
                                >
                                    {/* Thumbnail adaptive limits */}
                                    <div className="relative w-32 sm:w-40 h-20 sm:h-24 shrink-0 rounded-lg overflow-hidden border border-slate-800/60">
                                        <img src={rec.thumbnail} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" alt="thumb" />
                                    </div>
                                    <div className="flex flex-col min-w-0 justify-center">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition">{rec.title}</h4>
                                        <p className="text-[11px] text-slate-400 mt-1 truncate">@{rec.ownerDetails?.username || rec.owner?.fullName}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{rec.views} views</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 border border-dashed border-slate-800 rounded-xl text-center text-slate-600 text-xs">
                                No suggestions found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PLAYLIST MODAL FRAME */}
            {showPlaylistModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl mx-2">
                        <h2 className="text-lg font-bold mb-4 text-slate-100">Save to playlist</h2>
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {userPlaylists.length > 0 ? (
                                userPlaylists.map(pl => (
                                    <div
                                        key={pl._id}
                                        onClick={() => addVideoToPlaylist(pl._id)}
                                        className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/30 hover:bg-blue-600 hover:border-blue-500 text-sm transition cursor-pointer flex justify-between items-center group"
                                    >
                                        <span className="font-semibold text-slate-200 group-hover:text-white">{pl.name}</span>
                                        <span className="text-[10px] bg-slate-800 group-hover:bg-blue-700 border border-slate-700/50 px-2 py-0.5 rounded text-slate-400 group-hover:text-white">
                                            {pl.videos?.length || 0} videos
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-4 italic text-xs">No playlists found.</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowPlaylistModal(false)}
                            className="mt-5 w-full text-center text-sm font-bold text-slate-400 hover:text-white transition pt-2 border-t border-slate-700/50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoDetail;