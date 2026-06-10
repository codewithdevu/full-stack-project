import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { History, Heart, Settings, FolderPlus, ChevronRight, User, Sparkles, ArrowUpRight } from "lucide-react";
import apiClient from "../api/apiConfig";

const Library = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // 🟢 CURRENT USER DATA BOUNDS FETCHING
    useEffect(() => {
        apiClient.get("/users/current-user") // Apne verification router configuration check kr lena
            .then((res) => {
                if (res.data?.data) {
                    setCurrentUser(res.data.data);
                }
            })
            .catch((err) => console.log("Silent profile bind error: ", err));
    }, []);

    const libraryItems = [
        { 
            name: "History", 
            path: "/history", 
            icon: <History className="text-indigo-400 w-5 h-5" /> 
        },
        { 
            name: "Liked Videos", 
            path: "/liked", 
            icon: <Heart className="text-pink-400 w-5 h-5" /> 
        },
        { 
            name: "Playlists", 
            path: "/playlists", 
            icon: <FolderPlus className="text-purple-400 w-5 h-5" /> 
        },
        { 
            name: "Settings", 
            path: "/settings", 
            icon: <Settings className="text-slate-400 w-5 h-5" /> 
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-3.5 sm:px-6 pb-24 lg:hidden relative select-none overflow-x-hidden font-sans box-border w-full">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[90px] pointer-events-none z-0" />

            {/* --- 1. PREMIUM USER DYNAMIC CARD BLOCK --- */}
            <div className="relative z-10 bg-slate-900/20 border border-slate-900 rounded-2xl p-4 flex flex-col gap-4 shadow-xl backdrop-blur-md w-full box-border">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Glowing User Avatar Wrapper */}
                        <div className="p-0.5 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-full shrink-0">
                            <img 
                                src={currentUser?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=User"} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-950 shadow-md"
                                alt="user session head" 
                            />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-slate-100 truncate tracking-tight">
                                {currentUser?.fullName || "Velocity Creator"}
                            </h2>
                            <p className="text-[11px] font-mono text-indigo-400 truncate mt-0.5">
                                @{currentUser?.username || "identity_pending"}
                            </p>
                        </div>
                    </div>

                    {/* Pro Tag Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-linear-to-r from-indigo-500/15 to-pink-500/15 text-pink-300 border border-pink-500/30 text-[9px] font-bold shrink-0">
                        <Sparkles className="w-2.5 h-2.5" /> PRO
                    </span>
                </div>

                {/* 🟢 CHANNEL NAVIGATE REDIRECT BUTTON */}
                {currentUser?.username && (
                    <button
                        onClick={() => navigate(`/c/${currentUser.username}`)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-700 font-bold text-[11px] text-slate-300 hover:text-slate-100 flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98]"
                    >
                        Access Your Channel Hub <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                    </button>
                )}
            </div>
            
            {/* --- 2. DIRECTORY SHELF LIST --- */}
            <div className="space-y-3.5 relative z-10 mt-5 w-full box-border">
                {libraryItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/30 hover:bg-slate-900/40 border border-slate-900 hover:border-indigo-500/20 backdrop-blur-md active:scale-[0.97] transition-all duration-300 shadow-md box-border w-full"
                    >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="p-2.5 bg-slate-950 border border-slate-850/60 rounded-xl flex items-center justify-center shrink-0">
                                {item.icon}
                            </div>
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-slate-100 transition-colors tracking-wide truncate">
                                {item.name}
                            </span>
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
                    </Link>
                ))}
            </div>

            {/* Mobile Footer branding tag */}
            <div className="text-center pt-8 border-t border-slate-900/40 w-full mt-6">
                <span className="text-[9px] text-slate-600 font-mono tracking-wider uppercase block px-2 leading-relaxed">
                    VelocityStream Creator Console • Mobile Workspace
                </span>
            </div>

        </div>
    );
};

export default Library;