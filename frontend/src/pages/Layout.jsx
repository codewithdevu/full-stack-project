import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const Layout = () => {
    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans select-none">
            <Navbar /> 
            
            <div className="flex pt-16 flex-1">
                <Sidebar /> 
                
                <main className="flex-1 lg:ml-64">
                    <Outlet />
                </main>
            </div>
            
            <BottomNav />
        </div>
    );
};

export default Layout;