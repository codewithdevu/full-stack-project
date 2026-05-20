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
        <nav className="fixed top-0 z-50 w-full bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-4">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-blue-500 tracking-wider">MyTube</Link>

            {/* Search Bar Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-4 relative flex items-center">
                <input
                    type="text" 
                    placeholder="Search..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-12 text-white focus:outline-none focus:border-blue-500 text-sm transition"
                    value={searchQuery} // 🟢 FIXED: 'query' ko badal kar 'searchQuery' kiya
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Left Side Icon Layout */}
                <Search className="absolute left-3 text-slate-500 pointer-events-none" size={18} />
                
                {/* Right Side Clickable Search Submission Button */}
                <button 
                    type="submit" 
                    className="absolute right-3 text-slate-400 hover:text-white transition"
                >
                    <Search size={18} />
                </button>
            </form>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
                <Bell size={20} className="text-slate-400 cursor-pointer hover:text-white transition" />
                
                {/* User Avatar Router Channel Mapping */}
                <div
                    onClick={() => user ? navigate(`/c/${user.username}`) : navigate("/login")}
                    className="w-9 h-9 rounded-full overflow-hidden border border-slate-700 cursor-pointer hover:border-blue-500 transition"
                >
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <User size={20} className="text-slate-400" />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;