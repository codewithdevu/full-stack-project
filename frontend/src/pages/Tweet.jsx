import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { Trash2, Edit } from "lucide-react";



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

    if (loading && tweets.length === 0) {
        return <div className="text-white text-center mt-20 animate-pulse">Loading Tweets...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Community Tweets</h1>

                {/* CREATE TWEET COMPONENT */}
                <form onSubmit={handleCreateTweet} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-6 shadow-md">
                    <textarea
                        value={newTweet}
                        onChange={(e) => setNewTweet(e.target.value)}
                        placeholder="Bhai, kya chal raha hai dimaag mein? Likho yahan..."
                        className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-700 outline-none focus:border-blue-500 resize-none h-24 transition"
                        maxLength={280}
                        required
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-500">{newTweet.length}/280</span>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl font-bold transition text-sm">
                            Tweet
                        </button>
                    </div>
                </form>

                {/* READ / TWEETS LIST */}
                <div className="space-y-4">
                    {tweets.length > 0 ? (
                        tweets.map((tweet) => (
                            <div key={tweet._id} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-sm">

                                {/* Conditional Rendering: Check if editing this specific tweet */}
                                {editingTweet?._id === tweet._id ? (
                                    <form onSubmit={handleUpdateTweet} className="space-y-3">
                                        <textarea
                                            value={editingTweet.content}
                                            onChange={(e) => setEditingTweet({ ...editingTweet, content: e.target.value })}
                                            className="w-full bg-slate-900 rounded-xl p-3 border border-slate-700 outline-none focus:border-blue-500 resize-none"
                                            required
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button type="button" onClick={() => setEditingTweet(null)} className="px-3 py-1.5 rounded-lg border border-slate-600 text-sm hover:bg-slate-700">
                                                Cancel
                                            </button>
                                            <button type="submit" className="px-3 py-1.5 bg-blue-600 rounded-lg text-sm font-bold hover:bg-blue-700">
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {/* Tweet Content View */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-bold block text-sm">@{tweet.ownerDetails?.username || "user"}</span>
                                                <span className="text-xs text-slate-500">{new Date(tweet.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {/* Actions (Edit / Delete) */}
                                            {currentUser?._id === tweet.ownerDetails?._id && (
                                            <div className="flex gap-3">
                                                <button onClick={() => setEditingTweet(tweet)} className="text-slate-500 hover:text-blue-500 transition">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteTweet(tweet._id)} className="text-slate-500 hover:text-red-500 transition">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            )}
                                        </div>
                                        <p className="text-slate-200 text-base leading-relaxed wrap-break-word">{tweet.content}</p>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-500 italic">Koi tweet nahi mila, bhai. Pehla tweet dalo!</div>
                    )}
                </div>
            </div>
        </div>
    );

}
export default Tweet;