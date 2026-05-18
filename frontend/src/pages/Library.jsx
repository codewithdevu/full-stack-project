import React from "react";
import { Link } from "react-router-dom";
import { History, Heart, Settings, FolderPlus } from "lucide-react";

const Library = () => {
    const libraryItems = [
        { name: "History", path: "/history", icon: <History className="text-blue-500" size={24} /> },
        { name: "Liked Videos", path: "/liked", icon: <Heart className="text-pink-500" size={24} /> },
        { name: "Playlists", path: "/playlists", icon: <FolderPlus className="text-green-500" size={24} /> },
        { name: "Settings", path: "/settings", icon: <Settings className="text-slate-400" size={24} /> },
    ];

    return (
        <div className="p-4 space-y-6 lg:hidden"> {/* lg:hidden se ye laptop par access nahi hoga */}
            <h1 className="text-2xl font-bold border-b border-slate-800 pb-3">You</h1>
            
            <div className="space-y-2">
                {libraryItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition"
                    >
                        <div className="flex items-center gap-4">
                            {item.icon}
                            <span className="text-base font-medium text-slate-200">{item.name}</span>
                        </div>
                        <span className="text-slate-500 text-lg">→</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Library;