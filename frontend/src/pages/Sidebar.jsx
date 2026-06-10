import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
    Home, 
    LayoutDashboard, 
    History, 
    Heart, 
    Settings, 
    FolderPlus, 
    MessageSquare,
    ChevronRight,
    User,
    Cpu,
    RefreshCw
} from "lucide-react"; 
import apiClient from "../api/apiConfig.js";

const Sidebar = () => {
    const [myUsername, setMyUsername] = useState(null);
    const [isActiveTranscoding, setIsActiveTranscoding] = useState(false); // Live worker node tracking state
    const location = useLocation();

    // 🟢 DYNAMIC DATA PIPELINE CHECK
    useEffect(() => {
        // 1. Fetch current active session profile
        apiClient.get("/users/current-user")
            .then((res) => {
                if (res.data?.data?.username) {
                    setMyUsername(res.data.data.username);
                }
            })
            .catch(() => console.log("Sidebar: User offline"));

        // 2. Transcoding status checking loop (Quiet fetch)
        const checkActiveTranscodes = () => {
            apiClient.get("/videos") // Gets current user/channel videos
                .then((res) => {
                    const videoList = res.data?.data?.docs || res.data?.data || [];
                    const hasActiveJob = videoList.some(v => v.status === "pending" || v.status === "processing");
                    setIsActiveTranscoding(hasActiveJob);
                })
                .catch(() => console.log("Sidebar status check packet dropped"));
        };

        checkActiveTranscodes();
        const statusTimer = setInterval(checkActiveTranscodes, 10000); // Check every 10 seconds

        return () => clearInterval(statusTimer);
    }, [location.pathname]);

    const profilePath = myUsername ? `/c/${myUsername}` : "/login";

    const sections = [
        {
            title: "Menu",
            items: [
                { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
                { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> }
            ]
        },
        {
            title: "Library",
            items: [
                { name: "My Channel", path: profilePath, icon: <User className="w-4 h-4" /> }, // 🟢 INJECTED DYNAMIC PROFILE LINK
                { name: "History", path: "/history", icon: <History className="w-4 h-4" /> },
                { name: "Liked Videos", path: "/liked", icon: <Heart className="w-4 h-4" /> },
                { name: "Playlists", path: "/playlists", icon: <FolderPlus className="w-4 h-4" /> }
            ]
        },
        {
            title: "Community & Personal",
            items: [
                { name: "Tweet", path: "/tweet", icon: <MessageSquare className="w-4 h-4" /> },
                { name: "Settings", path: "/settings", icon: <Settings className="w-4 h-4" /> }
            ]
        }
    ];
    
    return (
        // Clean layout isolation for mobile views (strictly invisible on 375px screens)
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-slate-950/45 border-r border-slate-900/80 backdrop-blur-xl p-4 hidden lg:flex flex-col justify-between select-none z-30">
            <div className="space-y-6 overflow-y-auto scrollbar-none pr-1">
                {sections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="space-y-1.5">
                        {/* Section Header Label */}
                        <span className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
                            {section.title}
                        </span>

                        {/* Navigation Links */}
                        <div className="space-y-0.5">
                            {section.items.map(link => (
                                <NavLink 
                                    key={link.name} 
                                    to={link.path}
                                    className="group block"
                                >
                                    {({ isActive }) => (
                                        <div className={`
                                            flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                                            ${isActive 
                                                ? "bg-linear-to-r from-indigo-500/10 to-transparent text-indigo-200 border-l-2 border-indigo-500 shadow-xs shadow-indigo-500/5" 
                                                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-l-2 border-transparent hover:border-slate-800"
                                            }
                                        `}>
                                            <div className="flex items-center gap-3">
                                                <span className={`
                                                    shrink-0 transition-transform duration-300 group-hover:scale-110
                                                    ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}
                                                `}>
                                                    {link.icon}
                                                </span>
                                                <span className="tracking-wide">{link.name}</span>
                                            </div>
                                            <ChevronRight className={`
                                                w-3.5 h-3.5 text-slate-600 transition-transform duration-300 group-hover:translate-x-0.5
                                                ${isActive ? "opacity-100 text-indigo-400/70" : "opacity-0 group-hover:opacity-100"}
                                            `} />
                                        </div>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                        
                        {sectionIdx < sections.length - 1 && (
                            <hr className="border-slate-900/40 my-3 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            {/* 🟢 Sidebar Bottom Metadata Panel with Dynamic HLS Transcoder Node Indicators */}
            <div className="border-t border-slate-900/80 pt-4 px-3 flex flex-col gap-1 shrink-0 bg-transparent">
                <div className="flex items-center gap-2">
                    {isActiveTranscoding ? (
                        <>
                            <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                            <span className="text-[10px] text-indigo-400 font-bold tracking-wide animate-pulse">FFmpeg Core Compiling...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-slate-500 font-semibold tracking-wide">Transcoding Nodes Standby</span>
                        </>
                    )}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                    © {new Date().getFullYear()} VelocityStream Inc.
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;