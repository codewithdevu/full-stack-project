import React from "react";
import { Link } from "react-router-dom";
import { History, Heart, Settings, FolderPlus, ChevronRight, User, Sparkles } from "lucide-react";

const Library = () => {
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
        // Added standard pt-20 (Navbar distance) and pb-24 (BottomNav safe region) for 375px displays
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 px-3.5 sm:px-6 pb-24 lg:hidden relative select-none overflow-x-hidden font-sans box-border w-full">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[90px] pointer-events-none z-0" />

            {/* --- HEADER BLOCK --- */}
            <div className="border-b border-slate-900/80 pb-4 relative z-10 flex items-center justify-between pl-0.5">
                <div className="space-y-1">
                    <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
                            <User className="w-4 h-4" />
                        </div>
                        You
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-0.5">Workspace Directory</p>
                </div>
                
                {/* Visual Pro tag badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-linear-to-r from-indigo-500/15 to-pink-500/15 text-pink-300 border border-pink-500/30 text-[9px] font-bold shrink-0">
                    <Sparkles className="w-2.5 h-2.5" /> PRO
                </span>
            </div>
            
            {/* --- DIRECTORY SHELF LIST --- */}
            <div className="space-y-3.5 relative z-10 mt-5 w-full box-border">
                {libraryItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/30 hover:bg-slate-900/40 border border-slate-900 hover:border-indigo-500/20 backdrop-blur-md active:scale-[0.97] transition-all duration-300 shadow-md box-border w-full"
                    >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Icon embedded inside customized glass socket */}
                            <div className="p-2.5 bg-slate-950 border border-slate-850/60 rounded-xl flex items-center justify-center shrink-0">
                                {item.icon}
                            </div>
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-slate-100 transition-colors tracking-wide truncate">
                                {item.name}
                            </span>
                        </div>
                        
                        {/* Trailing chevron indicator */}
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
                    </Link>
                ))}
            </div>

            {/* Mobile Footer branding tag */}
            <div className="text-center pt-8 border-t border-slate-900/40 w-full">
                <span className="text-[9px] text-slate-600 font-mono tracking-wider uppercase block px-2 leading-relaxed">
                    VelocityStream Creator Console • Mobile Workspace
                </span>
            </div>

        </div>
    );
};

export default Library;