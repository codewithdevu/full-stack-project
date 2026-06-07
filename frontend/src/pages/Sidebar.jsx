import React from "react";
import { NavLink } from "react-router-dom";
import { 
    Home, 
    LayoutDashboard, 
    History, 
    Heart, 
    Settings, 
    FolderPlus, 
    MessageSquare 
} from "lucide-react";

const Sidebar = () => {
    const sections = [
        {
            title: "Menu",
            items: [
                { name: "Home", path: "/", icon: <Home size={20} /> },
                { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> }
            ]
        },
        {
            title: "Library",
            items: [
                { name: "History", path: "/history", icon: <History size={20} /> },
                { name: "Liked Videos", path: "/liked", icon: <Heart size={20} /> },
                { name: "Playlists", path: "/playlists", icon: <FolderPlus size={20} /> }
            ]
        },
        {
            title: "Community & Personal",
            items: [
                { name: "Tweet", path: "/tweet", icon: <MessageSquare size={20} /> }, // Custom Message Icon
                { name: "Settings", path: "/settings", icon: <Settings size={20} /> }
            ]
        }
    ];
    
    return (
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-[#0f0f0f] border-r border-zinc-800/80 p-4 hidden lg:flex flex-col justify-between select-none">
            <div className="space-y-4">
                {sections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="space-y-1">
                        {/* Section items rendering */}
                        {section.items.map(link => (
                            <NavLink 
                                key={link.name} 
                                to={link.path}
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ease-in-out
                                    ${isActive 
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15" 
                                        : "text-[#aaaaaa] hover:bg-zinc-900 hover:text-white"
                                    }
                                `}
                            >
                                <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                                    {link.icon}
                                </span>
                                <span>{link.name}</span>
                            </NavLink>
                        ))}
                        
                        {sectionIdx < sections.length - 1 && (
                            <hr className="border-zinc-800/80 my-3 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            <div className="px-4 py-2 text-[10px] text-zinc-600">
                © {new Date().getFullYear()} MyTube Inc.
            </div>
        </aside>
    );
};

export default Sidebar;