import React, { useEffect, useState } from "react";
import { Search, Bell, User, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/apiConfig.js";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await apiClient.get("/users/current-user");
                setUser(response.data?.data);
            } catch (error) {
                console.log("Navbar: User not logged in");
                setUser(null);
            }
        };

        fetchCurrentUser();
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-slate-950/45 border-b border-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 select-none shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            
            {/* 1. Brand Logo with Gradient Accents */}
            <Link 
                to="/" 
                className="flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0"
            >
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25">
                    <span className="text-white font-black text-sm tracking-tighter">MT</span>
                    <span className="absolute inset-0 rounded-lg bg-white/10 animate-pulse pointer-events-none" />
                </div>
                <span className="text-sm font-bold tracking-tight text-slate-100 hidden sm:inline-block">
                    My<span className="text-indigo-400 font-medium">Tube</span>
                </span>
            </Link>

            {/* 2. Premium Integrated Search Bar */}
            <form 
                onSubmit={handleSearchSubmit} 
                className="flex-1 max-w-lg mx-4 flex items-center bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden transition-all duration-300 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/25 focus-within:bg-slate-900/60"
            >
                {/* Search Text Input Area */}
                <div className="flex-1 flex items-center pl-3.5 pr-2 py-2">
                    <input
                        type="text" 
                        placeholder="Search videos, playlists, transcoders..."
                        className="w-full bg-transparent text-slate-200 placeholder-slate-500 border-0 outline-none focus:outline-none focus:ring-0 text-xs font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                {/* Interactive Search Submit Action */}
                <button 
                    type="submit" 
                    className="bg-slate-900/80 hover:bg-slate-800/80 border-l border-slate-800 text-slate-400 hover:text-slate-200 px-5 py-2.5 transition-colors duration-200 shrink-0 outline-none"
                >
                    <Search className="w-3.5 h-3.5" />
                </button>
            </form>

            {/* 3. Actions & Premium User Controls */}
            <div className="flex items-center gap-3.5 shrink-0">
                {/* Notifications Trigger */}
                <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent hover:border-slate-800/50 transition-all duration-300 group outline-none">
                    <Bell className="w-4.5 h-4.5 group-hover:rotate-6 transition-transform duration-300" />
                    {/* Pulsing indicator badge */}
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-pink-500 rounded-full shadow-md shadow-pink-500/40 animate-pulse" />
                </button>

                {/* Profile Avatar / Login Router Link */}
                <div
                    onClick={() => user ? navigate(`/c/${user.username}`) : navigate("/login")}
                    className="relative w-8.5 h-8.5 rounded-full p-[1.5px] cursor-pointer bg-linear-to-tr from-slate-800 to-slate-900 hover:from-indigo-500 hover:to-pink-500 transition-all duration-300 shadow-md shadow-slate-950/50 group"
                >
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="User avatar"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <User className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;