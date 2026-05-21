import React, { useState } from "react";
import apiClient from "../api/apiConfig.js";
import { Link, useNavigate } from "react-router-dom";

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
            
            alert("Register succesfully")
            // console.log("Register response:", response.data);
            navigate("/login");

        } catch (error) {
            console.error("Register Error full details:", error.response?.data || error.message);

            // 4. 🟢 CLOUD LAG FALLBACK: Agar Vercel slow hone par pehle hi background me user bana chuka h
            if (error.response?.status === 409) {
                alert("This account has already been registered successfully just now! Redirecting to login...");
                navigate("/login");
            } else {
                alert(error.response?.data?.message || "Registration failed! Check your input fields.");
            }
        } finally {
            // 5. 🔓 UNLOCK: Process complete hone par loader saaf karo
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-purple-500">Create Account</h2>

                <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        placeholder="Enter full name" 
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded focus:border-purple-500 outline-none transition"
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                        required 
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        placeholder="name@example.com" 
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded focus:border-purple-500 outline-none transition"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        required 
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1">Username</label>
                    <input 
                        type="text" 
                        placeholder="Choose username" 
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded focus:border-purple-500 outline-none transition"
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                        required 
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1">Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded focus:border-purple-500 outline-none transition"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                        required 
                    />
                </div>

                {/* Avatar Image Input - STRICTLY REQUIRED */}
                <div className="mb-5">
                    <label className="block text-sm text-slate-400 mb-2">
                        Avatar Image <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="file" 
                        accept="image/*"
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer transition"
                        onChange={(e) => setAvatar(e.target.files[0])} 
                        required 
                    />
                    {avatar && <p className="text-xs text-purple-400 mt-1 truncate">Selected: {avatar.name}</p>}
                </div>

                {/* Cover Image Input - CLEAN OPTIONAL SETUP */}
                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-2">
                        Cover Image <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input 
                        type="file" 
                        accept="image/*"
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-700 file:text-white hover:file:bg-slate-600 file:cursor-pointer transition"
                        onChange={(e) => setCoverImage(e.target.files[0])} 
                    />
                    {coverImage && <p className="text-xs text-slate-400 mt-1 truncate">Selected: {coverImage.name}</p>}
                </div>

                {/* SUBMIT BUTTON WITH RUNTIME DISABLER LOCK */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl text-sm font-extrabold transition ${
                        isSubmitting
                            ? "bg-purple-500/50 text-slate-400 cursor-not-allowed opacity-70"
                            : "bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98]"
                    }`}
                >
                    {isSubmitting ? "Uploading Files & Registering..." : "Register"}
                </button>

                <p className="mt-4 text-center text-slate-400 text-sm">
                    Already have an account? <Link to="/login" className="text-purple-500 hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;