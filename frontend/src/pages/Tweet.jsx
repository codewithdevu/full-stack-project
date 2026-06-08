import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Heart, User, Sparkles, MessageSquare } from "lucide-react";

// Helper function to format relative date
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

const Tweet = () => {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState("");
    const [editingTweet, setEditingTweet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const fetchTweets = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/tweets");
            if (response.data?.data) {
                setTweets(response.data?.data || []);
            }
        } catch (error) {
            console.error("Error fetching tweets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserDataAndTweets = async () => {
            try {
                fetchTweets();
                const userResponse = await apiClient.get("/users/current-user");
                if (userResponse.data?.data) {
                    setCurrentUser(userResponse.data.data);
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };
        fetchUserDataAndTweets();
    }, []);

    const handleCreateTweet = async (e) => {
        e.preventDefault();
        if (!newTweet.trim()) return;
        try {
            setLoading(true);
            const response = await apiClient.post("/tweets", { content: newTweet });
            if (response.data?.success) {
                setNewTweet("");
                fetchTweets();
            }
        } catch (error) {
            console.error("Error creating tweet:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTweet = async (e) => {
        e.preventDefault();
        if (!editingTweet?.content?.trim()) return;

        try {
            setLoading(true);
            const response = await apiClient.patch(`/tweets/${editingTweet._id}`, { content: editingTweet.content });
            if (response.data?.success) {
                setEditingTweet(null);
                fetchTweets();
            }
        } catch (error) {
            console.error("Error updating tweet:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTweet = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tweet?")) return;
        try {
            setLoading(true);
            await apiClient.delete(`/tweets/${id}`);
            fetchTweets();
        } catch (error) {
            console.error("Error deleting tweet:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTweetLike = async (tweetId) => {
        try {
            setTweets((prevTweets) =>
                prevTweets.map((t) => {
                    if (t._id === tweetId) {
                        const currentlyLiked = t.isLiked;
                        return {
                            ...t,
                            isLiked: !currentlyLiked,
                            likesCount: currentlyLiked ? (t.likesCount || 1) - 1 : (t.likesCount || 0) + 1
                        };
                    }
                    return t;
                })
            );
            await apiClient.post(`/likes/toggle/t/${tweetId}`);
        } catch (error) {
            console.error("Error toggling tweet like:", error);
            fetchTweets();
        }
    };

    if (loading && tweets.length === 0) {
        return (
            <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-spin">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">Syncing community discussions...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 pb-24 lg:pb-12 select-none relative overflow-hidden font-sans selection:bg-indigo-500/30">
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeInUpTweet {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-tweet-fade {
                    opacity: 0;
                    animation: fadeInUpTweet 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />

            {/* Background Ambient Lights */}
            <div className="absolute top-0 right-1/4 w-100 h-100 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-100 h-100 bg-purple-500/5 rounded-full blur-[110px] pointer-events-none z-0" />

            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                
                {/* Header Title Section */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-900 pl-1">
                    <span className="h-4.5 w-1 bg-linear-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
                    <h1 className="text-sm font-bold text-slate-100 tracking-wider uppercase flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" /> Creator Discussions
                    </h1>
                </div>

                {/* --- 1. TWEET EDITOR BOX (WITH DEEP AMBIENT DROP SHADOW) --- */}
                <div className="relative group animate-tweet-fade">
                    {/* Soft Glowing Back-glow */}
                    <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500/30 to-purple-500/30 rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition duration-500 pointer-events-none" />

                    {/* Editor Card with heavy shadow & normal interior */}
                    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl flex gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.75)] overflow-hidden">
                        
                        {/* Author Avatar */}
                        <div className="relative z-10 w-10 h-10 rounded-full overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <User className="w-4.5 h-4.5" />
                                </div>
                            )}
                        </div>

                        {/* Write Form Area (Normal/Clean interior) */}
                        <form onSubmit={handleCreateTweet} className="relative z-10 flex-1 space-y-3">
                            <textarea
                                value={newTweet}
                                onChange={(e) => setNewTweet(e.target.value)}
                                placeholder="What is on your mind? Share updates with fellow creators..."
                                className="w-full bg-transparent text-slate-100 text-xs md:text-sm outline-none placeholder-slate-600 resize-none h-20 leading-relaxed py-1"
                                maxLength={280}
                                required
                            />
                            <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                                <span className="text-[10px] text-slate-500 font-semibold font-mono">{newTweet.length} / 280</span>
                                
                                <button 
                                    type="submit" 
                                    className="relative overflow-hidden rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.98] bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-90 shadow-md"
                                >
                                    Post Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- 2. TWEETS LIST FEED CONTAINER (WITH DROP SHADOWS) --- */}
                <div className="space-y-4">
                    {tweets.length > 0 ? (
                        tweets.map((tweet) => (
                            <div 
                                key={tweet._id} 
                                className="bg-slate-900/35 border border-slate-900/80 p-5 rounded-2xl flex gap-4 animate-tweet-fade transition-all duration-300 hover:border-slate-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)]"
                            >
                                {/* Creator Avatar */}
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                                    <img 
                                        src={tweet.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${tweet.owner?.username}`} 
                                        alt="owner avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Inline Editing Form View */}
                                    {editingTweet?._id === tweet._id ? (
                                        <form onSubmit={handleUpdateTweet} className="space-y-3">
                                            <textarea
                                                value={editingTweet.content}
                                                onChange={(e) => setEditingTweet({ ...editingTweet, content: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs md:text-sm text-slate-100 outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/25 resize-none h-20"
                                                required
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditingTweet(null)} 
                                                    className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white transition-colors"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        /* Static Tweet Row View (Normal/Clean interior) */
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="min-w-0">
                                                    <span className="font-semibold text-xs md:text-sm text-slate-100 hover:text-indigo-400 transition-colors cursor-pointer block truncate">
                                                        @{tweet.owner?.username || "user"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5 block">
                                                        {formatTimeAgo(tweet.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Author Actions (Only show for tweet owner) */}
                                                {(currentUser?._id === tweet.owner?._id || currentUser?._id === tweet.owner) && (
                                                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/40 px-2 py-1 rounded-xl border border-slate-850">
                                                        <button 
                                                            onClick={() => setEditingTweet(tweet)} 
                                                            className="p-1 text-slate-500 hover:text-indigo-400 transition-colors active:scale-90"
                                                            title="Edit Tweet"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTweet(tweet._id)} 
                                                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors active:scale-90"
                                                            title="Delete Tweet"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Text Content */}
                                            <p className="text-slate-200 text-xs md:text-sm leading-relaxed wrap-break-word whitespace-pre-wrap font-medium">
                                                {tweet.content}
                                            </p>
                                            
                                            {/* Responsive Like Row */}
                                            <div className="flex items-center gap-6 pt-3 border-t border-slate-900/60">
                                                <button
                                                    onClick={() => handleToggleTweetLike(tweet._id)}
                                                    className={`flex items-center gap-1.5 text-xs font-semibold transition-all duration-150 group ${
                                                        tweet.isLiked ? "text-rose-500" : "text-slate-500 hover:text-rose-500"
                                                    }`}
                                                >
                                                    <Heart
                                                        className="w-4 h-4 group-active:scale-125 transition-transform duration-150"
                                                        fill={tweet.isLiked ? "currentColor" : "none"}
                                                    />
                                                    <span className="text-slate-400 text-[10px] font-mono">{tweet.likesCount || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Empty Feed State */
                        <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-xl mx-auto">
                            <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-4 text-slate-500">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-semibold text-slate-300">Feed Empty</h3>
                            <p className="text-[11px] text-slate-500 mt-2 max-w-xs leading-relaxed">
                                No updates shared yet. Write your first update using the editor above!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tweet;