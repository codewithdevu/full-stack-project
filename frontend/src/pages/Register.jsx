import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Shield, Lock, Sparkles, ArrowRight } from "lucide-react";
import apiClient from "../api/apiConfig";

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
    
    // UI Local Error Logging (No more annoying browser alerts!)
    const [uiError, setUiError] = useState(""); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        setUiError(""); // Reset error state

        if (!avatar) {
            setUiError("Core avatar artwork image is required to build your identity profile!");
            return;
        }

        const data = new FormData();

        // 🟢 FIX KEY CASING MATCHING BACKEND CONTROLLER LOGIC:
        // 'fullname' ko badal kar 'fullName' kiya taaki req.body validation pass ho jaye!
        data.append("fullName", formData.fullName.trim()); 
        data.append("email", formData.email.trim());
        data.append("username", formData.username.trim().toLowerCase()); 
        data.append("password", formData.password); 

        if (avatar) {
            data.append("avatar", avatar);
        }

        if (coverImage) {
            data.append("coverImage", coverImage);
        }

        try {
            setIsSubmitting(true);
            console.log("Initializing account creation pipeline hooks...");

            await apiClient.post("/users/register", data, {
                timeout: 90000 
            });
            
            navigate("/login");

        } catch (error) {
            console.error("Register Error full details:", error.response?.data || error.message);

            if (error.response?.status === 409) {
                setUiError("This username or email already exists!");
                setTimeout(() => navigate("/login"), 2000); // Redirect smoothly
            } else {
                const serverErrorMessage = typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>')
                    ? "Server rejected payload field maps (400 Bad Request). Please check backend parameter logs."
                    : error.response?.data?.message;

                setUiError(serverErrorMessage || "Registration dropped! Please verify structural fields and try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 xs:p-4 md:p-8 overflow-hidden font-sans selection:bg-indigo-500/30">
            
            {/* Ambient Background Atmosphere */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.12] pointer-events-none z-0" />
            <div className="absolute top-1/4 right-1/4 w-72 h-72 sm:w-125 sm:h-125 bg-purple-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '7s' }} />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-125 sm:h-125 bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '9s' }} />

            {/* Premium Registration Container */}
            <div className="relative w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-5 xs:p-6 sm:p-8 z-10 overflow-hidden transition-all duration-300">
                
                {/* Visual Top Highlight Accent Strip */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-purple-500 via-indigo-500 to-pink-500" />

                {/* Header branding & subtitle */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-950 border border-slate-800/80 text-purple-400 mb-2.5 shadow-inner">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">Create Creator Profile</h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 px-1 balance">Get instant access to HLS transcoding nodes and developer dashboard metrics</p>
                </div>

                {/* Inline Production UI Error Display banner */}
                {uiError && (
                    <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                        ⚠️ {uiError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    
                    {/* Responsive Double Column Input Block */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Full Name</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                                    <User className="w-4 h-4" />
                                </span>
                                <input 
                                    type="text" 
                                    value={formData.fullName} 
                                    placeholder="Enter your full name" 
                                    className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 focus:bg-slate-900/60 hover:border-slate-700"
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
                                    value={formData.email} 
                                    placeholder="Enter your email address" 
                                    className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 focus:bg-slate-900/60 hover:border-slate-700"
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
                                    value={formData.username} 
                                    placeholder="Enter your username" 
                                    className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 focus:bg-slate-900/60 hover:border-slate-700"
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
                                    value={formData.password} 
                                    placeholder="••••••••••••" 
                                    className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 focus:bg-slate-900/60 hover:border-slate-700"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>

                    </div>

                    {/* Integrated Upload Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1">
                        
                        {/* Avatar Image upload block */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                Avatar Image <span className="text-purple-500">*</span>
                            </label>
                            <div className="relative flex items-center justify-center w-full bg-slate-950/30 border border-slate-800/80 hover:border-purple-500/30 rounded-xl p-2.5 transition-colors duration-300 group overflow-hidden">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="w-full text-[11px] text-slate-400 cursor-pointer max-w-full
                                        file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-950 file:text-indigo-300 hover:file:bg-slate-900 file:text-[10px] file:font-semibold"
                                    onChange={(e) => setAvatar(e.target.files[0])} 
                                    required 
                                />
                            </div>
                            {avatar && <p className="text-[10px] text-indigo-400 truncate max-w-full pl-1 font-mono">Ready: {avatar.name}</p>}
                        </div>

                        {/* Cover Image upload block */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                Cover Image <span className="text-slate-600 font-medium">(Optional)</span>
                            </label>
                            <div className="relative flex items-center justify-center w-full bg-slate-950/30 border border-slate-800/80 hover:border-slate-700 rounded-xl p-2.5 transition-all duration-300 overflow-hidden">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="w-full text-[11px] text-slate-400 cursor-pointer max-w-full
                                        file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-950 file:text-slate-400 hover:file:bg-slate-900 file:text-[10px] file:font-semibold"
                                    onChange={(e) => setCoverImage(e.target.files[0])} 
                                />
                            </div>
                            {coverImage && <p className="text-[10px] text-slate-400 truncate max-w-full pl-1 font-mono">Ready: {coverImage.name}</p>}
                        </div>

                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full group overflow-hidden rounded-xl py-2.5 sm:py-3 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 outline-none"
                    >
                        <span className={`absolute inset-0 w-full h-full bg-linear-to-r ${isSubmitting ? 'from-slate-800 to-slate-900' : 'from-purple-600 via-indigo-600 to-pink-600'} transition-all duration-300 group-hover:opacity-95`} />
                        <span className="absolute -inset-px rounded-xl bg-linear-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />
                        
                        <span className="relative flex items-center justify-center gap-1.5 px-2 text-center">
                            <span className="truncate">
                                {isSubmitting ? "Uploading profile assets onto cloud server clusters..." : "Register Creator Channel"}
                            </span>
                            {!isSubmitting && <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />}
                        </span>
                    </button>

                </form>

                {/* Redirect Footer action link */}
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-900/80 text-center">
                    <p className="text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-1">
                        <span>Already have an established channel?</span>
                        <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors outline-none">
                            Login here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Register;