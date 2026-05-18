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
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 pb-24 lg:pb-8">
            <div className="max-w-6xl mx-auto">
                
                {/* 🟢 HEADER SECTION: Mobile standard scaling fix */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-10">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">My Playlists</h1>
                        <p className="text-xs md:text-sm text-slate-400 mt-0.5">Manage your curated collections</p>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)} 
                        className="flex items-center justify-center gap-2 bg-blue-600 px-5 py-3 sm:py-2 rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-[0.98] transition shadow-lg shadow-blue-600/10 w-full sm:w-auto"
                    >
                        <FolderPlus size={18} /> Create New
                    </button>
                </div>

                {playlists.length === 0 && !loading && (
                    <div className="text-center text-slate-500 mt-20 text-sm md:text-base">
                        Abhi tak koi playlist nahi banayi. Ek nayi banao!
                    </div>
                )}

                {/* 🟢 CARD GRID: Fluid container sizing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {playlists.map((pl) => (
                        <div
                            key={pl._id}
                            onClick={() => navigate(`/playlist/${pl._id}`)}
                            className="bg-slate-800 p-4 rounded-2xl border border-slate-700/60 cursor-pointer hover:border-blue-500 hover:bg-slate-800/80 transition-all duration-200 group shadow-md"
                        >
                            {/* YT Style Folder Cover */}
                            <div className="aspect-video bg-slate-700/60 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden border border-slate-700/30">
                                <ListVideo size={36} className="text-slate-400 group-hover:scale-110 transition duration-300" />
                                
                                {/* Balanced Counter Badge */}
                                <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-100 border border-slate-700/50">
                                    {pl.videos?.length || 0} Videos
                                </div>
                            </div>
                            
                            <div className="px-1 min-w-0">
                                <h3 className="font-bold text-base text-slate-100 truncate group-hover:text-blue-400 transition">{pl.name}</h3>
                                <p className="text-slate-400 text-xs mt-1 line-clamp-2 min-h-8 leading-relaxed">{pl.description || "No description provided."}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CREATE PLAYLIST MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-5 md:p-6 shadow-2xl mx-2">
                        <h2 className="text-lg md:text-xl font-bold mb-5 text-slate-100">Create New Playlist</h2>

                        <form onSubmit={handleCreatePlaylist} className="space-y-4">
                            <div>
                                <label className="text-xs md:text-sm text-slate-400 block mb-1">Playlist Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newPlaylistData.name}
                                    onChange={(e) => setNewPlaylistData({ ...newPlaylistData, name: e.target.value })}
                                    placeholder="e.g. My Favorite Songs"
                                    className="w-full bg-slate-900 border border-slate-700 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 text-slate-100 transition"
                                />
                            </div>

                            <div>
                                <label className="text-xs md:text-sm text-slate-400 block mb-1">Description (Optional)</label>
                                <textarea
                                    value={newPlaylistData.description}
                                    onChange={(e) => setNewPlaylistData({ ...newPlaylistData, description: e.target.value })}
                                    placeholder="What's this playlist about?"
                                    rows="3"
                                    className="w-full bg-slate-900 border border-slate-700 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 text-slate-100 transition resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition font-medium text-xs md:text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 text-white transition text-xs md:text-sm"
                                >
                                    {loading ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Playlist;




