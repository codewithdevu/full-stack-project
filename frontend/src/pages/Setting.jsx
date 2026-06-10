import React, { useState, useEffect } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { User, Lock, Camera, Image as ImageIcon, Loader2, Sparkles, UploadCloud, ShieldCheck } from "lucide-react";

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // States for different Forms
    const [accountData, setAccountData] = useState({
        fullName: '',
        email: '',
    });
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    // 🟢 NEW: Component mount hote hi current information pre-load aur fill karein
    useEffect(() => {
        const fetchCurrentProfileMeta = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/users/current-user");
                if (response.data?.data) {
                    setAccountData({
                        fullName: response.data.data.fullName || "",
                        email: response.data.data.email || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching settings profile node:", error);
                if (error.response?.status === 401) navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentProfileMeta();
    }, [navigate]);

    // 1. Update Personal Info
    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        if (!accountData.fullName.trim() || !accountData.email.trim()) {
            return alert("Fields cannot be empty!");
        }
        try {
            setLoading(true);
            await apiClient.patch("/users/update-account", accountData);
            alert("Account updated successfully!");
        } catch (error) {
            alert(error.response?.data?.message || "Error updating account");
        } finally {
            setLoading(false);
        }
    };

    // 2. Update password
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await apiClient.patch("/users/change-password", passwords);
            alert("Password updated successfully!");
            setPasswords({
                oldPassword: '',
                newPassword: '',
            });
        } catch (error) {
            alert(error.response?.data?.message || "Error updating password");
        } finally {
            setLoading(false);
        }
    };

    // 3. Update Avatar and CoverImage (Multipart form data)
    const handleUpdateImages = async (type) => {
        const file = type === 'avatar' ? avatar : coverImage;
        if (!file) {
            return alert("Please select an image to upload");
        }

        const formData = new FormData();
        formData.append(type, file);
        try {
            setLoading(true);
            await apiClient.patch(`/users/${type === 'avatar' ? 'avatar' : 'cover-image'}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
            if (type === 'avatar') {
                setAvatar(null);
            } else {
                setCoverImage(null);
            }
        } catch (error) {
            alert("Image upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        // ⚠️ FIXED: Updated top padding to pt-20 for navbar protection symmetry
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pt-20 px-4 md:p-8 pb-24 lg:pb-12 select-none relative overflow-x-hidden font-sans box-border w-full">
            
            {/* Ambient Lighting Backdrops */}
            <div className="absolute top-0 right-1/4 w-72 h-72 sm:w-87.5 sm:h-87.5 bg-indigo-500/5 rounded-full blur-[90px] sm:blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-87.5 sm:h-87.5 bg-purple-500/5 rounded-full blur-[90px] sm:blur-[100px] pointer-events-none z-0" />

            {/* Title Section */}
            <div className="border-b border-slate-900 pb-4 sm:pb-5 space-y-1 relative z-10 pl-0.5">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" /> Account & Security
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 hidden xs:block">Manage public profile attributes, digital assets, and authentication keys</p>
            </div>

            {/* --- SECTION 1: PROFILE IMAGES (AVATAR & COVER IMAGE) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 relative z-10 w-full box-border">
                
                {/* Avatar upload card */}
                <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900/80 p-4 sm:p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors duration-300 shadow-md w-full box-border min-w-0">
                    <div className="space-y-3.5 w-full">
                        <h2 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-0.5">
                            <Camera className="w-4 h-4 text-indigo-400 shrink-0" /> Avatar Image
                        </h2>
                        
                        <div className="relative group cursor-pointer border-2 border-dashed border-slate-800 hover:border-indigo-500/30 rounded-xl p-4 sm:p-5 text-center transition-colors bg-slate-950/20 w-full box-border overflow-hidden">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setAvatar(e.target.files[0])} 
                                className="absolute inset-0 opacity-0 z-10 cursor-pointer w-full h-full" 
                            />
                            <div className="flex flex-col items-center gap-2 w-full min-w-0">
                                <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 group-hover:text-slate-300 truncate w-full px-1">
                                    {avatar ? avatar.name : "Select raw square image to upload"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleUpdateImages('avatar')} 
                        disabled={loading} 
                        className="w-full mt-4 sm:mt-5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 rounded-xl py-2.5 text-xs font-semibold transition-all duration-300 active:scale-[0.97] disabled:opacity-50 outline-none flex items-center justify-center gap-1.5"
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Upload Avatar File
                    </button>
                </div>

                {/* Cover Image upload card */}
                <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900/80 p-4 sm:p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors duration-300 shadow-md w-full box-border min-w-0">
                    <div className="space-y-3.5 w-full">
                        <h2 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-0.5">
                            <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" /> Cover Artwork
                        </h2>
                        
                        <div className="relative group cursor-pointer border-2 border-dashed border-slate-800 hover:border-purple-500/30 rounded-xl p-4 sm:p-5 text-center transition-colors bg-slate-950/20 w-full box-border overflow-hidden">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setCoverImage(e.target.files[0])} 
                                className="absolute inset-0 opacity-0 z-10 cursor-pointer w-full h-full" 
                            />
                            <div className="flex flex-col items-center gap-2 w-full min-w-0">
                                <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
                                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 group-hover:text-slate-300 truncate w-full px-1">
                                    {coverImage ? coverImage.name : "Select horizontal wide format artwork"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleUpdateImages('coverImage')} 
                        disabled={loading} 
                        className="w-full mt-4 sm:mt-5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 rounded-xl py-2.5 text-xs font-semibold transition-all duration-300 active:scale-[0.97] disabled:opacity-50 outline-none flex items-center justify-center gap-1.5"
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Upload Cover File
                    </button>
                </div>

            </div>

            {/* --- SECTION 2: PERSONAL INFORMATION FORM --- */}
            <form onSubmit={handleUpdateAccount} className="bg-slate-900/30 backdrop-blur-xl p-4 xs:p-6 sm:p-8 rounded-2xl border border-slate-900/80 space-y-4 sm:space-y-6 relative z-10 shadow-md hover:border-slate-800 transition-colors duration-300 w-full box-border">
                
                <h2 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-0.5">
                    <User className="w-4 h-4 text-indigo-400 shrink-0" /> Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Full Name */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-0.5">Full Name</label>
                        <div className="relative group w-full">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <User className="w-4 h-4" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Enter full name" 
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60 box-border" 
                                value={accountData.fullName} 
                                onChange={(e) => setAccountData({...accountData, fullName: e.target.value})} 
                                required
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-0.5">Email Address</label>
                        <div className="relative group w-full">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <User className="w-4 h-4" />
                            </span>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60 box-border" 
                                value={accountData.email} 
                                onChange={(e) => setAccountData({...accountData, email: e.target.value})} 
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-1 w-full flex sm:justify-start">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="relative w-full group overflow-hidden rounded-xl py-2.5 text-xs font-bold transition-all duration-300 active:scale-[0.97] disabled:opacity-50 outline-none"
                    >
                        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:opacity-90" />
                        <span className="relative flex items-center justify-center uppercase tracking-wider text-white whitespace-nowrap">
                            Update Details
                        </span>
                    </button>
                </div>

            </form>

            {/* --- SECTION 3: SECURITY & PASSWORD --- */}
            <form onSubmit={handleUpdatePassword} className="bg-slate-900/30 backdrop-blur-xl p-4 xs:p-6 sm:p-8 rounded-2xl border border-slate-900/80 space-y-4 sm:space-y-6 relative z-10 shadow-md hover:border-slate-800 transition-colors duration-300 w-full box-border">
                
                <h2 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-0.5">
                    <Lock className="w-4 h-4 text-rose-400 shrink-0" /> Security Keys & Password
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Current Password */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-0.5">Current Password</label>
                        <div className="relative group w-full">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input 
                                type="password" 
                                placeholder="••••••••••••" 
                                required 
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 transition-all duration-300 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 focus:bg-slate-900/60 box-border" 
                                value={passwords.oldPassword} 
                                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-0.5">New Password</label>
                        <div className="relative group w-full">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input 
                                type="password" 
                                placeholder="••••••••••••" 
                                required 
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 focus:bg-slate-900/60 box-border" 
                                value={passwords.newPassword} 
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-1 w-full flex sm:justify-start">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-56 px-6 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/20 text-xs font-bold transition-all duration-300 active:scale-[0.97] uppercase tracking-wider disabled:opacity-50 outline-none whitespace-nowrap"
                    >
                        {loading && <Loader2 className="animate-spin w-3.5 h-3.5" />} 
                        Change Password Keys
                    </button>
                </div>

            </form>
        </div>
    )
};

export default Settings;