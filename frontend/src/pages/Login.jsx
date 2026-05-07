import React, { useState } from "react";
import apiClient from "../api/apiConfig";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [loginId , setLoginId] = useState("");
    const [password , setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post("/users/login" , {
                email: loginId,
                password: password
            });
            
            console.log("response.data: " , response.data);
            
            if (response.data) {
                alert("Login Successfully!")
                navigate("/dashboard")
            }
        } catch (error) {
            alert("Login failed! Check Email or Password")
        }
    }

    return(
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">Welcome Back</h2>

                <input type="text" placeholder="Email Or Username" className="w-full p-3 mb-4 bg-slate-900 border border-slate-700 rounded focus:border-blue-500 outline-none"
                onChange={(e) => setLoginId(e.target.value)} required/>

                <input type="Password" placeholder="Password" className="w-full p-3 mb-6 bg-slate-900 border border-slate-700 rounded focus:border-blue-500 outline-none"
                onChange={(e) => setPassword(e.target.value)} required/>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200">Login</button>

                <p className="mt-4 text-center text-slate-400">Don't have an account? <Link to="/register" className="text-blue-500">Register</Link></p>
            </form>
        </div>
    )

};

export default Login;