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

    // 1. 🟢 STATE LOCK: Double hit aur network resets firing ko block karne ke liye
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 2. 🟢 SAFETY GATE: Agar request already network par h, toh doosra click yahin par block!
        if (isSubmitting) return;

        const data = new FormData();

        // Text fields append karein safely
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key].trim());
            }
        });

        // Files append karein exact backend keys se match karke
        if (avatar) {
            data.append("avatar", avatar);
        }

        if (coverImage) {
            data.append("coverImage", coverImage);
        }

        try {
            // 3. LOCK SET: Connection start hote hi guard band kar do
            setIsSubmitting(true);
            console.log("Sending registration data...");

            // Axios ko explicitly Headers aur network wait timeout batayein
            const response = await apiClient.post("/users/register", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 60000 // 60 seconds ka extra window serverless cloud parsing ke liye
            });

            console.log("Register response:", response.data);
            alert("Registration Successful!");
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
            // 5. 🔓 UNLOCK: Chahe success ho ya network fail, loader saaf karo
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-purple-500">Create Account</h2>

                <input type="text" placeholder="Full Name" className="w-full p-3 mb-4 bg-slate-900 border border-slate-700 rounded focus:border-purple-500 outline-none"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />

                <input type="email" placeholder="Email Address" className="w-full p-3 mb-4 bg-slate-900 border border-slate-700 rounded focus:border-purple-500 outline-none"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />

                <input type="text" placeholder="Username" className="w-full p-3 mb-4 bg-slate-900 border border-slate-700 rounded focus:border-purple-500 outline-none"
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />

                <input type="password" placeholder="Password" className="w-full p-3 mb-4 bg-slate-900 border border-slate-700 rounded focus:border-purple-500 outline-none"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />

                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-2">Avatar Image</label>
                    <input type="file" className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        onChange={(e) => setAvatar(e.target.files[0])} required />
                </div>
                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-2">Cover Image</label>
                    <input type="file" className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        onChange={(e) => setCoverImage(e.target.files[0])} required />
                </div>

                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded transition duration-200">Register</button>

                <p className="mt-4 text-center text-slate-400">Already have an account? <Link to="/login" className="text-purple-500">Login</Link></p>
            </form>
        </div>
    );
};

export default Register;