import React, { useState } from "react";
import apiClient from "../api/apiConfig";
import { User, Lock, Camera, Image as ImageIcon, Loader2, Sparkles, UploadCloud, ShieldCheck } from "lucide-react";

const Settings = () => {
    const [loading, setLoading] = useState(false);

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

    // 1. Update Personal Info
    const handleUpdateAccount = async (e) => {
        e.preventDefault();
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
        <div className="max-w-4xl mx-auto space-y-8 pb-16 select-none relative overflow-hidden font-sans pt-8">
            
            {/* Ambient Lighting Backdrops */}
            <div className="absolute top-0 right-1/4 w-87.5[h-87.5-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-87.5 h-87.5 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

            {/* Title Section */}
            <div className="border-b border-slate-900 pb-5 space-y-1 relative z-10">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" /> Account & Security
                </h1>
                <p className="text-xs text-slate-400 mt-1">Manage public profile attributes, digital assets, and authentication keys</p>
            </div>

            {/* --- SECTION 1: PROFILE IMAGES (AVATAR & COVER IMAGE) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                
                {/* Avatar upload card */}
                <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors duration-300 shadow-md">
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Camera className="w-4 h-4 text-indigo-400" /> Avatar Image
                        </h2>
                        
                        <div className="relative group cursor-pointer border-2 border-dashed border-slate-800 hover:border-indigo-500/30 rounded-xl p-5 text-center transition-colors bg-slate-950/20">
                            <input 
                                type="file" 
                                onChange={(e) => setAvatar(e.target.files[0])} 
                                className="absolute inset-0 opacity-0 z-10 cursor-pointer" 
                            />
                            <div className="flex flex-col items-center gap-2">
                                <UploadCloud className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-300">
                                    {avatar ? avatar.name : "Select raw square image to upload"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleUpdateImages('avatar')} 
                        disabled={loading} 
                        className="w-full mt-5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 rounded-xl py-2.5 text-xs font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                    >
                        Upload Avatar File
                    </button>
                </div>

                {/* Cover Image upload card */}
                <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors duration-300 shadow-md">
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-400" /> Cover Artwork
                        </h2>
                        
                        <div className="relative group cursor-pointer border-2 border-dashed border-slate-800 hover:border-purple-500/30 rounded-xl p-5 text-center transition-colors bg-slate-950/20">
                            <input 
                                type="file" 
                                onChange={(e) => setCoverImage(e.target.files[0])} 
                                className="absolute inset-0 opacity-0 z-10 cursor-pointer" 
                            />
                            <div className="flex flex-col items-center gap-2">
                                <UploadCloud className="w-6 h-6 text-slate-600 group-hover:text-purple-400 transition-colors" />
                                <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-300">
                                    {coverImage ? coverImage.name : "Select horizontal wide format artwork"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleUpdateImages('coverImage')} 
                        disabled={loading} 
                        className="w-full mt-5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 rounded-xl py-2.5 text-xs font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                    >
                        Upload Cover File
                    </button>
                </div>

            </div>

            {/* --- SECTION 2: PERSONAL INFORMATION FORM --- */}
            <form onSubmit={handleUpdateAccount} className="bg-slate-900/30 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-900/80 space-y-6 relative z-10 shadow-md hover:border-slate-800 transition-colors duration-300">
                
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" /> Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-0.5">Full Name</label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <User className="w-4 h-4" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Enter full name" 
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-550 transition-all duration-300
                                    focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60" 
                                value={accountData.fullName} 
                                onChange={(e) => setAccountData({...accountData, fullName: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-0.5">Email Address</label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <User className="w-4 h-4" />
                            </span>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-550 transition-all duration-300
                                    focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60" 
                                value={accountData.email} 
                                onChange={(e) => setAccountData({...accountData, email: e.target.value})} 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="relative group overflow-hidden rounded-xl px-6 py-2.5 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                    >
                        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:opacity-90" />
                        <span className="relative flex items-center justify-center">
                            Update Details
                        </span>
                    </button>
                </div>

            </form>

            {/* --- SECTION 3: SECURITY & PASSWORD --- */}
            <form onSubmit={handleUpdatePassword} className="bg-slate-900/30 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-900/80 space-y-6 relative z-10 shadow-md hover:border-slate-800 transition-colors duration-300">
                
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-400" /> Security Keys & Password
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-0.5">Current Password</label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input 
                                type="password" 
                                placeholder="••••••••••••" 
                                required 
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-550 transition-all duration-300
                                    focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 focus:bg-slate-900/60" 
                                value={passwords.oldPassword} 
                                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-0.5">New Password</label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input 
                                type="password" 
                                placeholder="••••••••••••" 
                                required 
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-550 transition-all duration-300
                                    focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 focus:bg-slate-900/60" 
                                value={passwords.newPassword} 
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/20 text-xs font-semibold transition-all duration-300 active:scale-[0.98]"
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