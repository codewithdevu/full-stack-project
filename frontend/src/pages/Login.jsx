import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, User, Sparkles } from "lucide-react";
import apiClient from "../api/apiConfig";

const Login = () => {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await apiClient.post("/users/login", {
                emailOrUsername: loginId.trim(), 
                password: password
            });

            console.log("Login response target payload: ", response.data);

            // 🟢 STRICT CHECK & RELOAD REDIRECT:
            // Sahi login par navigate karne se pehle window reload ya standard hook trigger chalega
            if (response.data?.success || response.status === 200) {
                // Pehle dashboard path navigate set karo
                navigate("/");
                // Fast hard reload browser context taaki Navbar immediately session data fetch kar sake
                window.location.reload();
            }
        } catch (error) {
            console.error("Login error full details:", error.response?.data || error.message);
            const serverMessage = error.response?.data?.message || "Login failed! Check Email or Password";
            alert(serverMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 xs:p-3 overflow-hidden font-sans selection:bg-indigo-500/30">
            
            {/* 1. Global Visual Layers (Background Grid & Ambient Lighting) */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.12] pointer-events-none z-0" />
            <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-112.5 sm:h-112.5 bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-112.5 sm:h-112.5 bg-purple-500/10 rounded-full blur-[80px] sm:blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />

            {/* 2. Glassmorphic Auth Form Wrapper */}
            <div className="relative w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden">
                
                {/* Visual Top Highlight Accent Strip */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Header branding & intro */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-950 border border-slate-800/80 text-indigo-400 mb-3 sm:mb-4 shadow-inner">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">Login to Your Account</h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 px-2">Enter your credentials to access your account</p>
                </div>

                {/* Authentication Form */}
                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                    
                    {/* Identifier Input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Email or Username</label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <User className="w-4 h-4" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Enter your email or username" 
                                className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                    focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60
                                    hover:border-slate-700"
                                onChange={(e) => setLoginId(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center gap-2">
                            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Password</label>
                            <Link to="/change-password" className="text-[10px] font-medium text-slate-500 hover:text-indigo-400 transition-colors whitespace-nowrap">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input 
                                type="password" 
                                placeholder="••••••••••••" 
                                className="w-full bg-slate-950/45 border border-slate-800/80 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 transition-all duration-300
                                    focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 focus:bg-slate-900/60
                                    hover:border-slate-700"
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full group overflow-hidden rounded-xl py-2.5 sm:py-3 text-xs font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 outline-none"
                    >
                        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:opacity-95" />
                        <span className="absolute -inset-px rounded-xl bg-linear-to-r from-indigo-400 to-pink-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />
                        
                        <span className="relative flex items-center justify-center gap-1.5 px-2 text-center">
                            <span className="truncate">
                                {isSubmitting ? "Authenticating session..." : "Continue to Dashboard"}
                            </span>
                            {!isSubmitting && <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />}
                        </span>
                    </button>
                </form>

                {/* Redirect Footer block */}
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-900/80 text-center">
                    <p className="text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-1">
                        <span>Don't have a creator account?</span>
                        <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors outline-none">
                            Register now
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;