import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const Layout = () => {
    return (
        // Global styling boundaries to completely drop any responsive layout width breakouts
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans select-none overflow-x-hidden box-border">
            
            {/* Top Fixed Navigation Header */}
            <Navbar />

            {/* Main Application Shell Flex Track */}
            {/* pt-16 ensures content stays safely below fixed navbar heights */}
            <div className="flex pt-16 w-full min-h-[calc(min-h-screen-16)] box-border relative">
                
                {/* Desktop Left Fixed Sidebar */}
                {/* Hidden on mobile viewports via its internal tailwind query layers */}
                <Sidebar />
                
                {/* 🟢 FIXED MAIN APP ENGINE VIEWPANEL */}
                {/* Added uniform px-3.5 sm:px-6 md:px-8 gaps so pages grids never stick raw to the screen glass boundaries */}
                <main className="flex-1 w-full max-w-full lg:pl-64 px-3.5 sm:px-6 md:px-8 pb-20 lg:pb-6 overflow-x-hidden box-border">
                    <Outlet />
                </main>
                
            </div>

            {/* Mobile Bottom Navigation Bar Trigger (Hidden on lg layout break-points) */}
            <BottomNav />
        </div>
    );
};

export default Layout;