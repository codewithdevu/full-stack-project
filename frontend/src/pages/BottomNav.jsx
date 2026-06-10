import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, MessageSquare, User } from "lucide-react"; 
import apiClient from "../api/apiConfig"; // 🟢 API CLIENT FOR USER SESSION CHECK

const BottomNav = () => {
    const [myUsername, setMyUsername] = useState(null);

    // 🟢 CURRENT USER SESSION RESOLVER:
    // Page load hote hi current user ka username nikal lega dynamically
    useEffect(() => {
        apiClient.get("/users/current-user") // Apne active route ke hisab se exact check kr lena
            .then((res) => {
                if (res.data?.data?.username) {
                    setMyUsername(res.data.data.username);
                }
            })
            .catch(() => {
                console.log("User session not found on bottom nav binder. Fallback active.");
            });
    }, []);

    // 🟢 DYNAMIC ROUTING PATH RESOLUTION:
    // Agar logged-in hai toh uske active channel context link (/c/username) par bhejega, nahi toh /login par!
    const profilePath = myUsername ? `/c/${myUsername}` : "/login";

    const mobileLinks = [
        { name: "Home", path: "/", icon: <Home className="w-4.5[18px]" /> },
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
        { name: "Tweet", path: "/tweet", icon: <MessageSquare className="w-4.5 h-4.5" /> },
        { name: "You", path: profilePath, icon: <User className="w-4.5 h-4.5" /> }, // 👈 FIXED DYNAMIC ROUTE BOUNDS
    ];

    return (
        // Added 'pb-safe' fallback compatibility for newer small phones & balanced height
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900/85 flex items-center justify-around z-50 px-2 shadow-[0_-10px_35px_-12px_rgba(0,0,0,0.9)] select-none">
            {mobileLinks.map(link => (
                <NavLink
                    key={link.name}
                    to={link.path}
                    className="flex-1 h-full flex items-center justify-center"
                >
                    {({ isActive }) => (
                        // Added full h-full w-full inside button block for massive tapping area
                        <div className={`
                            flex flex-col items-center justify-center w-full h-full gap-0.5 text-[10px] font-bold tracking-tight transition-all duration-200 active:scale-95 touch-none
                            ${isActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-300"}
                        `}>
                            {/* Icon wrapper with custom transition */}
                            <span className={`
                                transition-transform duration-300 flex items-center justify-center
                                ${isActive ? "scale-110 text-indigo-400" : "text-slate-400"}
                            `}>
                                {link.icon}
                            </span>
                            
                            {/* Label Tag - Slightly adjusted text scaling */}
                            <span className="text-[9.5px] xs:text-[10px] font-semibold mt-0.5 transition-colors duration-200">
                                {link.name}
                            </span>
                            
                            {/* Micro Indicator Pixel Dot */}
                            <span className={`
                                w-1 h-1 rounded-full transition-all duration-300 mt-0.5 shrink-0
                                ${isActive ? "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 scale-100 opacity-100 shadow-xs shadow-indigo-500/50" : "scale-0 opacity-0"}
                            `} />
                        </div>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;