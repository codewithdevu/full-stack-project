import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig.js";
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, Share2, MessageSquare, Trash2, Pencil } from "lucide-react";



const VideoDetail = () => {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [comment, setComment] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (videoId) {
            fetchVideoDetail();
            fetchRecommendations();
        }
    }, [videoId]);


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
        }
    }, [videoId]);

    const handleLike = async () => {
        try {
            // 1. Backend hit karo
            const response = await apiClient.post(`/likes/toggle/v/${videoId}`);

            // 2. UI ko bina refresh kiye update karo (Optimistic Update)
            // Agar pehle liked tha, toh count -1 karo, varna +1
            setVideo((prev) => ({
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
            }));

        } catch (error) {
            console.error("Error: liking video: ", error);
            // Agar error aaye toh wapas purani state par le jao (Optional)
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



    if (loading) {
        return <div className="text-white text-center mt-20">Loading Video...</div>;
    }
    if (!video) {
        return <div className="text-white text-center mt-20">Video not found!</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 lg:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Video & Info */}
                <div className="lg:col-span-2">
                    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                        <video src={video.videoFile} controls poster={video.thumbnail} className="w-full h-full" autoPlay />
                    </div>

                    <div className="mt-4">
                        <h1 className="text-2xl font-bold">{video.title}</h1>
                        <div className="flex flex-wrap justify-between items-center mt-2 pb-4 border-b border-slate-700 gap-4">
                            <span className="text-slate-400 text-sm">{video.views} views • {new Date(video.createdAt).toLocaleDateString()}</span>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 ${video.isLiked
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                >
                                    {/* Fill property tabhi dikhegi jab video liked ho */}
                                    <ThumbsUp
                                        size={18}
                                        fill={video.isLiked ? "white" : "none"}
                                        className={video.isLiked ? "animate-bounce" : ""}
                                    />
                                    <span className="font-bold">{video.likesCount || 0}</span>
                                </button>
                                <button className="bg-slate-800 px-5 py-2 rounded-full hover:bg-slate-700 transition">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="flex items-center justify-between mt-6 p-4 bg-slate-800/40 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-4 cursor-pointer group"
                            onClick={() => navigate(`/c/${video.owner?.username}`)}>
                            <img src={video.owner?.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500" />
                            <div>
                                <h3 className="font-bold text-lg">{video.owner?.fullName}</h3>
                                {/* 🟢 Subscribers Count dikhao */}
                                <p className="text-slate-400 text-xs">
                                    @{video.owner?.username} • {video.subscribersCount || 0} Subscribers
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleSubscribe}
                            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${video.isSubscribed
                                ? "bg-slate-700 text-slate-300 border border-slate-600"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                }`}
                        >
                            {video.isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-slate-800/20 rounded-xl text-slate-300 text-sm whitespace-pre-wrap">{video.description}</div>

                    {/* Comments Section */}
                    <div className="mt-10">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20} /> {comment.length} Comments</h2>
                        <div className="flex gap-4 mb-8 items-end">
                            <input
                                value={newComment} onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..." className="flex-1 bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none py-2"
                            />
                            <button onClick={postComment} className="bg-blue-600 px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">Post</button>
                        </div>

                        <div className="space-y-6">
                            {comment.map((c) => (
                                <div key={c._id} className="flex gap-4 group relative">
                                    <img src={c.owner?.avatar || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover border border-slate-800" />

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-blue-400">@{c.owner?.username}</span>
                                            <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm mt-1 text-slate-200">{c.content}</p>
                                    </div>

                                    {/* 🟢 Logic: Agar comment owner aur log-in user same hain, tabhi buttons dikhao */}
                                    {c.owner?._id === currentUser?._id && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-start">
                                            <button
                                                onClick={() => editComment(c._id, c.content)}
                                                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-400 transition"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteComment(c._id)}
                                                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-red-500 transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Suggestions (Empty for now) */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-lg mb-4 text-slate-100">Next Videos</h3>

                    {recommendations.length > 0 ? (
                        recommendations.map((rec) => (
                            <div
                                key={rec._id}
                                onClick={() => navigate(`/video/${rec._id}`)}
                                className="flex gap-3 cursor-pointer group"
                            >
                                <div className="relative w-40 h-24 shrink-0 rounded-lg overflow-hidden border border-slate-800">
                                    <img src={rec.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <h4 className="text-sm font-bold line-clamp-2 leading-snug">{rec.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1">{rec.owner?.fullName}</p>
                                    <p className="text-[10px] text-slate-500">{rec.views} views</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 border border-dashed border-slate-700 rounded-xl text-center text-slate-600">
                            No suggestions found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoDetail;