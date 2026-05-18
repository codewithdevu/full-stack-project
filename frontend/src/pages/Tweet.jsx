import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { Trash2, Edit, Heart} from "lucide-react";


const Tweet = () => {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState("");
    const [editingTweet, setEditingTweet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

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
    }

    useEffect(() => {
        fetchTweets();
    }, []);

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
    }

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
    }

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
    }

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
        return <div className="text-white text-center mt-20 animate-pulse">Loading Tweets...</div>;
    }

return (
        <div className="min-h-screen bg-slate-900 text-white p-3 md:p-8 pb-24 lg:pb-8 select-none">
            <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Header Title */}
                <div className="pl-1">
                    <h1 className="text-xl md:text-2xl font-extrabold border-l-4 border-blue-500 pl-3 tracking-tight text-slate-100">
                        Community Tweets
                    </h1>
                </div>

                {/* CREATE TWEET COMPONENT */}
                <form onSubmit={handleCreateTweet} className="bg-slate-800 p-4 rounded-2xl border border-slate-700/60 shadow-lg">
                    <textarea
                        value={newTweet}
                        onChange={(e) => setNewTweet(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl p-3 border border-slate-700/50 outline-none focus:border-blue-500 resize-none h-24 transition placeholder:text-slate-600"
                        maxLength={280}
                        required
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                        <span className="text-[11px] text-slate-500 font-medium">{newTweet.length}/280</span>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] px-5 py-1.5 rounded-xl font-bold transition text-xs md:text-sm shadow-md shadow-blue-600/10">
                            Tweet
                        </button>
                    </div>
                </form>

                {/* READ / TWEETS LIST CONTAINER */}
                <div className="space-y-3.5">
                    {tweets.length > 0 ? (
                        tweets.map((tweet) => (
                            <div key={tweet._id} className="bg-slate-800 border border-slate-700/60 p-4 rounded-2xl shadow-md transition-all duration-200">

                                {/* Conditional Rendering: Check if editing this specific tweet */}
                                {editingTweet?._id === tweet._id ? (
                                    <form onSubmit={handleUpdateTweet} className="space-y-3">
                                        <textarea
                                            value={editingTweet.content}
                                            onChange={(e) => setEditingTweet({ ...editingTweet, content: e.target.value })}
                                            className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl p-3 border border-slate-700/50 outline-none focus:border-blue-500 resize-none h-20"
                                            required
                                        />
                                        <div className="flex gap-2 justify-end pt-1">
                                            <button 
                                                type="button" 
                                                onClick={() => setEditingTweet(null)} 
                                                className="px-3 py-1.5 rounded-xl border border-slate-600 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="px-4 py-1.5 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-600/10"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {/* Tweet Content Header View */}
                                        <div className="flex justify-between items-start gap-2 mb-2.5">
                                            <div className="min-w-0 flex flex-col">
                                                <span className="font-bold text-sm text-slate-200 truncate">@{tweet.owner?.username || "user"}</span>
                                                <span className="text-[10px] text-slate-500 font-medium mt-0.5">{new Date(tweet.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {/* 🟢 FIXED CONDITION: 'tweet.owner?._id' ya 'tweet.owner' ko verify karega taki icons show hon */}
                                            {(currentUser?._id === tweet.owner?._id || currentUser?._id === tweet.owner) && (
                                                <div className="flex items-center gap-2 shrink-0 bg-slate-900/40 px-2 py-1 rounded-lg border border-slate-700/30">
                                                    <button 
                                                        onClick={() => setEditingTweet(tweet)} 
                                                        className="p-1 text-slate-400 hover:text-blue-400 transition active:scale-90"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteTweet(tweet._id)} 
                                                        className="p-1 text-slate-400 hover:text-red-400 transition active:scale-90"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Text Content View */}
                                        <p className="text-slate-200 text-sm md:text-base leading-relaxed wrap-break-word px-0.5">
                                            {tweet.content}
                                        </p>
                                        
                                        {/* Like Interface Row */}
                                        <div className="flex items-center gap-6 mt-3.5 pt-2.5 border-t border-slate-700/40">
                                            <button
                                                onClick={() => handleToggleTweetLike(tweet._id)}
                                                className={`flex items-center gap-1.5 text-xs font-bold transition-colors duration-200 group ${
                                                    tweet.isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400"
                                                }`}
                                            >
                                                <Heart
                                                    size={16}
                                                    className="group-active:scale-125 transition-transform duration-150"
                                                    fill={tweet.isLiked ? "currentColor" : "none"}
                                                />
                                                <span className="text-slate-300 font-semibold">{tweet.likesCount || 0}</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500 italic text-sm border border-dashed border-slate-800 rounded-2xl">
                            Write your first tweet!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
export default Tweet;