import React, { useState } from "react";
import { Search , Bell , User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
    const [query , setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?query=${query}`);
        }
    };

    return (
        <nav className="fixed top-0 z-50 w-full bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-4">
            <Link to="/" className="text-xl font-bold text-blue-500">MyTube</Link>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 relative">
                <input 
                    type="text" placeholder="Search..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 px-10 focus:outline-none focus:border-blue-500"
                    value={query} onChange={(e) => setQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            </form>

            <div className="flex items-center gap-4">
                <Bell size={20} className="text-slate-400 cursor-pointer hover:text-white" />
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer">
                    <User size={18} />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;