import React, { useEffect, useState } from "react";
import { Search, Bell, User } from "lucide-react";
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
        /* Navbar: clean and floating shadow */
        <nav className="fixed top-0 z-50 w-full bg-[#0f0f0f] h-16 flex items-center justify-between px-4 sm:px-6 select-none shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            
            {/* 1. Brand Logo */}
            <Link 
                to="/" 
                className="text-xl font-black tracking-wider bg-linear-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
            >
                MyTube
            </Link>

            {/* 2. Simple Flat Search Bar (No Blue/White Borders) */}
            <form 
                onSubmit={handleSearchSubmit} 
                className="flex-1 max-w-lg mx-4 flex items-center bg-[#1c1c1f] rounded-full overflow-hidden border-0 outline-none transition-colors duration-150"
            >
                {/* Search Text Input */}
                <div className="flex-1 flex items-center pl-4 pr-2 py-1.5">
                    <Search size={16} className="text-zinc-500 mr-2.5 shrink-0" />
                    <input
                        type="text" 
                        placeholder="Search videos, playlists..."
                        className="w-full bg-transparent text-white placeholder-zinc-500 border-0 outline-none focus:outline-none focus:ring-0 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                {/* Simple Search Button */}
                <button 
                    type="submit" 
                    className="bg-[#2a2a2e] hover:bg-[#333338] text-zinc-300 px-6 py-2.5 transition duration-150 shrink-0 outline-none border-0"
                >
                    <Search size={16} />
                </button>
            </form>

            {/* 3. Right side Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors duration-150 relative group outline-none border-0">
                    <Bell size={20} className="text-zinc-400 group-hover:text-white group-hover:rotate-6 transition-all" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-[#0f0f0f]" />
                </button>
                
                <div
                    onClick={() => user ? navigate(`/c/${user.username}`) : navigate("/login")}
                    className="w-9 h-9 rounded-full overflow-hidden border border-zinc-850 cursor-pointer hover:border-blue-500 hover:scale-105 transition-all duration-200 bg-zinc-900 flex items-center justify-center shadow-lg"
                >
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <User size={18} className="text-zinc-400" />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;