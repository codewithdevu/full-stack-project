import React, { useState, useEffect } from "react";
import { FolderPlus, ListVideo, Compass, Sparkles, Plus, X, FileText } from "lucide-react";
import apiClient from "../api/apiConfig.js";
import { useNavigate } from "react-router-dom";

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
                setPlaylists(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, []);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistData.name.trim()) return alert("Name is required!");

        try {
            setLoading(true);
            const response = await apiClient.post("/playlist/", {
                name: newPlaylistData.name,
                description: newPlaylistData.description
            });

            if (response.data?.success) {
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

    if (loading && playlists.length === 0) {
        return (
            // Added 'pt-20' padding adjustments to balance loading skeletons below fixed navbar offsets
            <div className="w-full min-h-screen bg-slate-950 pt-20 px-4 md:p-8 space-y-8 flex flex-col justify-start">
                <div className="max-w-6xl mx-auto w-full space-y-6">
                    <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 animate-pulse">
                        <div className="space-y-2">
                            <div className="h-6 bg-slate-900 rounded w-48" />
                            <div className="h-3 bg-slate-900 rounded w-32" />
                        </div>
                        <div className="h-9 bg-slate-900 rounded-xl w-28 shrink-0" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse">
                                <div className="aspect-video bg-slate-900/80 rounded-xl w-full" />
                                <div className="space-y-2.5 py-0.5">
                                    <div className="h-3.5 bg-slate-900/80 rounded w-5/6" />
                                    <div className="h-3 bg-slate-900/80 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        // Added standard pt-20 layer and pb-24 for absolute clearance on mobile devices
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-3.5 sm:px-6 lg:px-8 pb-24 lg:pb-12 select-none relative overflow-x-hidden font-sans box-border w-full">
            
            {/* Ambient Lighting Backdrops */}
            <div className="absolute top-0 right-1/4 w-72 h-72 sm:w-100 sm:h-100 bg-indigo-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-100 sm:h-100 bg-purple-500/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8 box-border w-full">
                
                {/* --- HEADER BLOCK --- */}
                {/* Fixed column row alignments under 480px screen widths */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 border-b border-slate-900/80 pb-4 sm:pb-5 pl-0.5 w-full">
                    <div className="space-y-1">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                            <ListVideo className="w-5 h-5 text-indigo-400 shrink-0" /> Curated Collections
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1 hidden xs:block">Compile and organize digital stream catalogs inside customized profiles</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowCreateModal(true)} 
                        className="relative group overflow-hidden rounded-xl px-4.5 py-2.5 sm:py-3 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.97] shrink-0 w-full xs:w-auto"
                    >
                        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:opacity-95" />
                        <span className="absolute -inset-px rounded-xl bg-linear-to-r from-indigo-400 to-pink-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                            <FolderPlus className="w-4 h-4 shrink-0" /> Create Collection
                        </span>
                    </button>
                </div>

                {/* --- NULL STATE FALLBACK --- */}
                {playlists.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-md mx-auto mt-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-3.5 text-slate-500 shadow-inner">
                            <FolderPlus className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-xs font-semibold text-slate-300">No Playlists Configured</h3>
                        <p className="text-[11px] text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                            Start categorizing catalog uploads by configuring a new stream playlist using the creation module.
                        </p>
                    </div>
                )}

                {/* --- COLLECTIONS CARD GRID --- */}
                {/* Gap values corrected for horizontal stability at 375px boundaries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-300 w-full box-border">
                    {playlists.map((pl) => (
                        <div
                            key={pl._id}
                            onClick={() => navigate(`/playlist/${pl._id}`)}
                            className="group flex flex-col cursor-pointer rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/40 hover:shadow-xl hover:shadow-indigo-500/5 sm:hover:-translate-y-1.5 shadow-md w-full box-border"
                        >
                            {/* physical-style cover stack */}
                            <div className="aspect-video bg-slate-950 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden border border-slate-900 w-full">
                                <ListVideo className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 group-hover:scale-105 transition-all duration-300 shrink-0" />
                                
                                {/* Monospace Glass Badging counter */}
                                <div className="absolute bottom-2 right-2 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-slate-300 font-mono border border-slate-800/80 shadow-md">
                                    {pl.videos?.length || 0} Streams
                                </div>
                            </div>
                            
                            <div className="px-0.5 min-w-0 flex-1 flex flex-col justify-between space-y-1 w-full">
                                <h3 className="font-semibold text-xs sm:text-sm text-slate-100 truncate group-hover:text-indigo-400 transition-colors w-full">
                                    {pl.name}
                                </h3>
                                <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 min-h-10">
                                    {pl.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- CREATE COLLECTION MODAL DIALOG --- */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-3 xs:p-4 backdrop-blur-md">
                    <div className="bg-slate-950 border border-slate-800/80 w-full max-w-md rounded-2xl p-5 xs:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 box-border overflow-hidden">
                        
                        {/* Close Action */}
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="absolute right-4 top-4 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all outline-none"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase mb-5 flex items-center gap-2.5">
                            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                                <FolderPlus className="w-4 h-4" />
                            </div>
                            New Collection
                        </h2>

                        <form onSubmit={handleCreatePlaylist} className="space-y-4 w-full">
                            
                            {/* Name Input */}
                            <div className="space-y-1.5 w-full">
                                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-0.5">Playlist Title</label>
                                <div className="relative group w-full">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                        <Sparkles className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        value={newPlaylistData.name}
                                        onChange={(e) => setNewPlaylistData({ ...newPlaylistData, name: e.target.value })}
                                        placeholder="e.g. My Favorite Streams"
                                        className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 transition-all duration-300
                                            focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60 box-border"
                                    />
                                </div>
                            </div>

                            {/* Description textarea */}
                            <div className="space-y-1.5 w-full">
                                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-0.5">Description</label>
                                <div className="relative group w-full">
                                    <span className="absolute top-3 left-3.5 flex text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                        <FileText className="w-4 h-4" />
                                    </span>
                                    <textarea
                                        value={newPlaylistData.description}
                                        onChange={(e) => setNewPlaylistData({ ...newPlaylistData, description: e.target.value })}
                                        placeholder="What type of streams are curated here?"
                                        rows="3"
                                        className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 transition-all duration-300 resize-none
                                            focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60 h-20 box-border"
                                    />
                                </div>
                            </div>

                            {/* Action Operations */}
                            <div className="flex gap-2.5 pt-1.5 w-full">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs font-semibold transition-all outline-none"
                                >
                                    Cancel
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative flex-1 group overflow-hidden rounded-xl py-2.5 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.97] disabled:opacity-50 outline-none"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 to-purple-600 transition-all duration-300 group-hover:opacity-90" />
                                    <span className="relative flex items-center justify-center">
                                        {loading ? "Compiling..." : "Build Archive"}
                                    </span>
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