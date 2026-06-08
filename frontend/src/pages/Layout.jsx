import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans select-none">
            <Navbar />

            <div className="flex pt-16">
                <Sidebar />

                <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
                    <Outlet />
                </main>
            </div>

            <BottomNav />
        </div>
    );
};

export default Layout;