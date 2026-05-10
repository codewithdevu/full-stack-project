import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
    return (
    <div className="min-h-screen bg-slate-900 text-white">
        <Navbar /> 
        <div className="flex pt-16">
            <Sidebar /> 
            <main className="flex-1 lg:ml-64 p-6">
             <Outlet/> {/* other routes will be rendered here */} 
            </main>
        </div>
    </div>
    )
};

export default Layout;