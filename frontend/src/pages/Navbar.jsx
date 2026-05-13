import React, { useEffect, useState } from "react";
import { Search, Bell, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/apiConfig.js";

const Navbar = () => {
    const [query, setQuery] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?query=${query}`);
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