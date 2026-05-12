import React from "react";
import {NavLink} from "react-router-dom";
import { Home , LayoutDashboard , History , Heart  , Settings} from "lucide-react";

const Sidebar = () => {
    const links = [
        { name: "Home" ,  path: "/" , icon: <Home size={20} /> },
        { name: "Dashboard" ,  path: "/dashboard" , icon: <LayoutDashboard size={20} /> },
        { name: "History" ,  path: "/history" , icon: <History size={20} /> },
        { name: "Liked Videos" ,  path: "/liked" , icon: <Heart size={20} /> },
        { name: "Settings" ,  path: "/settings" , icon: <Settings size={20} /> },
    ];
    
    return (
        <aside className="fixed left-0 top-16 w-64 h-full bg-slate-900 border-r border-slate-800 p-4 hidden lg:block">
                <div className="space-y-2">
                    {links.map(link => (
                        <NavLink 
                            key={link.name} to={link.path}
                            className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition ${isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
                        >
                            {link.icon} <span>{link.name}</span>
                        </NavLink>
                    ))}
                </div>
            </aside>
    );
};

export default Sidebar;
