import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const Layout = () => {
    return (
        // Added 'w-full overflow-x-hidden' to kill any horizontal layout leakage globally
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans select-none overflow-x-hidden">
            
            {/* Top Fixed Navigation Header */}
            <Navbar />

            {/* Main Application Shell Flex Track */}
            <div className="flex pt-16 w-full box-border">
                
                {/* Desktop Left Fixed Sidebar (Hidden on mobile screens via its internal lg:flex structure) */}
                <Sidebar />
                
                <main className="flex-1 w-full max-w-full lg:pl-64 pb-16 lg:pb-0 overflow-x-hidden box-border">
                    <Outlet />
                </main>
                
            </div>

            {/* Mobile Bottom Navigation Bar Trigger */}
            <BottomNav />
        </div>
    );
};

export default Layout;