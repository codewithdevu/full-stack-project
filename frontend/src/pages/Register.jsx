import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Shield, Lock, UploadCloud, Camera, Sparkles, ArrowRight } from "lucide-react";
import apiClient from "../api/apiConfig.js";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
    });

    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key].trim());
            }
        });

        if (avatar) {
            data.append("avatar", avatar);
        }

        if (coverImage) {
            data.append("coverImage", coverImage);
        }

        try {
            setIsSubmitting(true);
            console.log("Sending registration data...");

            const response = await apiClient.post("/users/register", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 60000 
            });
            
            navigate("/login");

        } catch (error) {
            console.error("Register Error full details:", error.response?.data || error.message);

            if (error.response?.status === 409) {
                alert("This account has already been registered successfully just now! Redirecting to login...");
                navigate("/login");
            } else {
                alert(error.response?.data?.message || "Registration failed! Check your input fields.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans selection:bg-indigo-500/30">
            
            {/* 1. Ambient Background Atmosphere */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.12] pointer-events-none z-0" />
            <div className="absolute top-1/4 right-1/4 w-1255h-125purple-500/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '7s' }} />
            <div className="absolute bottom-1/4 left-1/4 w-125 h-125 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '9s' }} />

            {/* 2. Premium Registration Container */}
            <div className="relative w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden transition-all duration-300">
                
                {/* Visual Top Highlight Accent Strip */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-purple-500 via-indigo-500 to-pink-500" />

                {/* Header branding & subtitle */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-950 border border-slate-800/80 text-purple-400 mb-3 shadow-inner">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-100">Create Creator Profile</h2>
                    <p className="text-xs text-slate-400 mt-1">Get instant access to HLS transcoding nodes and developer dashboard metrics</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Responsive Double Column Input Block */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Full Name</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                                    <User className="w-4 h-4" />
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Enter your full name" 
                                    className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 focus:bg-slate-900/60 hover:border-slate-750"
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Email Address</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input 
                                    type="email" 
                                    placeholder="Enter your email address" 
                                    className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 focus:bg-slate-900/60 hover:border-slate-750"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Username</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                                    <Shield className="w-4 h-4" />
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Enter your username" 
                                    className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 focus:bg-slate-900/60 hover:border-slate-750"
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Password</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input 
                                    type="password" 
                                    placeholder="••••••••••••" 
                                    className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 focus:bg-slate-900/60 hover:border-slate-750"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>

                    </div>

                    {/* Integrated Upload Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                        
                        {/* Avatar Image upload block */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                    Avatar Image <span className="text-purple-500">*</span>
                                </label>
                            </div>
                            <div className="relative flex items-center justify-center w-full bg-slate-950/30 border border-slate-800/80 hover:border-purple-500/30 rounded-xl p-3 transition-colors duration-300 group">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="w-full text-[11px] text-slate-400 cursor-pointer
                                        file:mr-3.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-950 file:text-indigo-300 hover:file:bg-slate-900 file:text-[10px] file:font-semibold"
                                    onChange={(e) => setAvatar(e.target.files[0])} 
                                    required 
                                />
                            </div>
                            {avatar && <p className="text-[10px] text-indigo-400 truncate max-w-full pl-1">Selected: {avatar.name}</p>}
                        </div>

                        {/* Cover Image upload block */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                Cover Image <span className="text-slate-600 font-medium">(Optional)</span>
                            </label>
                            <div className="relative flex items-center justify-center w-full bg-slate-950/30 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 transition-all duration-300">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="w-full text-[11px] text-slate-400 cursor-pointer
                                        file:mr-3.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-950 file:text-slate-400 hover:file:bg-slate-900 file:text-[10px] file:font-semibold"
                                    onChange={(e) => setCoverImage(e.target.files[0])} 
                                />
                            </div>
                            {coverImage && <p className="text-[10px] text-slate-400 truncate max-w-full pl-1">Selected: {coverImage.name}</p>}
                        </div>

                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full group overflow-hidden rounded-xl py-3 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
                    >
                        {/* Background dynamic state gradient config */}
                        <span className={`absolute inset-0 w-full h-full bg-linear-to-r ${isSubmitting ? 'from-slate-800 to-slate-900' : 'from-purple-600 via-indigo-600 to-pink-600'} transition-all duration-300 group-hover:opacity-95`} />
                        <span className="absolute -inset-px rounded-xl bg-linear-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />
                        
                        <span className="relative flex items-center justify-center gap-1.5">
                            {isSubmitting ? "Uploading profile assets..." : "Register Creator Channel"}
                            {!isSubmitting && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
                        </span>
                    </button>

                </form>

                {/* Redirect Footer action link */}
                <div className="mt-8 pt-6 border-t border-slate-900/80 text-center">
                    <p className="text-xs text-slate-400">
                        Already have an established channel?{" "}
                        <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors ml-1">
                            Login here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Register;