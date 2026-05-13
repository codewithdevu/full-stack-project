import React, { useState, useEffect } from "react";
import { FolderPlus, ListVideo } from "lucide-react"
import apiClient from "../api/apiConfig.js";
import { useNavigate, useParams } from "react-router-dom";

const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistData, setNewPlaylistData] = useState({ name: "", description: "" });


    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoading(true);

                // 1. Current logged-in user ki ID lo
                const userRes = await apiClient.get("/users/current-user");
                const userId = userRes.data.data._id;

                const response = await apiClient.get(`/playlist/user/${userId}`);
                setPlaylists(response.data?.data);
            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, []);



    // Function to handle creation
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistData.name.trim()) return alert("Name is required!");

        try {
            setLoading(true);
            // Backend: POST /playlist
            const response = await apiClient.post("/playlist/", {
                name: newPlaylistData.name,
                description: newPlaylistData.description
            });

            if (response.data?.success) {
                // Nayi playlist ko list mein add karo bina refresh kiye
                setPlaylists([response.data.data, ...playlists]);
                setShowCreateModal(false);
                setNewPlaylistData({ name: "", description: "" });
                alert("Playlist created successfully!");
            }
        } catch (error) {
            console.error("Error creating playlist:", error);
            alert("Failed to create playlist");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold">My Playlists</h1>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <FolderPlus size={20} /> Create New
                    </button>
                </div>

                {playlists.length === 0 && !loading && (
                    <div className="text-center text-slate-500 mt-20">
                        Abhi tak koi playlist nahi banayi. Ek nayi banao!
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {playlists.map((pl) => (
                        <div
                            key={pl._id}
                            onClick={() => navigate(`/playlist/${pl._id}`)}
                            className="bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500 transition group"
                        >
                            <div className="aspect-video bg-slate-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                                <ListVideo size={40} className="text-slate-500 group-hover:scale-110 transition" />
                                <div className="absolute bottom-0 right-0 bg-blue-600 px-2 py-1 text-xs font-bold">
                                    {pl.videos?.length || 0} Videos
                                </div>
                            </div>
                            <h3 className="font-bold text-lg truncate">{pl.name}</h3>
                            <p className="text-slate-400 text-xs mt-1 line-clamp-1">{pl.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6">Create New Playlist</h2>

                        <form onSubmit={handleCreatePlaylist} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Playlist Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newPlaylistData.name}
                                    onChange={(e) => setNewPlaylistData({ ...newPlaylistData, name: e.target.value })}
                                    placeholder="e.g. My Favorite Songs"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Description (Optional)</label>
                                <textarea
                                    value={newPlaylistData.description}
                                    onChange={(e) => setNewPlaylistData({ ...newPlaylistData, description: e.target.value })}
                                    placeholder="What's this playlist about?"
                                    rows="3"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 transition resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition text-white"
                                >
                                    {loading ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Playlist;




