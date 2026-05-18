import React from "react";
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, MessageSquare, User } from "lucide-react"; // User icon library ke liye

const BottomNav = () => {
    const mobileLinks = [
        { name: "Home", path: "/", icon: <Home size={22} /> },
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={22} /> },
        { name: "Tweet", path: "/tweet", icon: <MessageSquare size={22} /> },
        { name: "You", path: "/library", icon: <User size={22} /> }, // 🟢 Library page ka link
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around z-50 px-2 shadow-2xl">
            {mobileLinks.map(link => (
                <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 text-[10px] font-medium transition ${isActive ? "text-blue-500" : "text-slate-400"}`}
                >
                    {link.icon}
                    <span>{link.name}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;