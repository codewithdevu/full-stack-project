import React, {useState} from "react";
import apiClient from "../api/apiConfig";
import { User, Lock , Camera, Image as ImageIcon , Loader2 } from "lucide-react";
import { Form } from "react-router-dom";


const Settings = () => {
    const [loading, setLoading] = useState(false);

    // States for diffrent Forms
    const [accountData , setAccountData] = useState({
        fullName: '',
        email: '',
    });
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        // confirmPassword: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [coverImage , setCoverImage] = useState(null);


    // 1 Update Personal Info
    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await apiClient.patch("/users/update-account" , accountData);
            alert("Account updated successfully!");
        } catch (error) {
            alert(error.response?.data?.message || "Error updating account");
        } finally {
            setLoading(false);
        }
    };

    // 2 Update password
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await apiClient.patch("/users/change-password" , passwords);
            alert("password updated successfully!");
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

    // 3 update Avatar and CoverImage (Multipart form data)

    const handleUpdateImages = async (type) => {
        const file = type === 'avatar' ? avatar : coverImage;
        if (!file) {
            return alert("Please select an image to upload");
        }

        const formData = new FormData();
        formData.append(type, file);
        try {
            setLoading(true);
            await apiClient.patch(`/users/${type === 'avatar' ? 'avatar' : 'cover-image'}` , formData , {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
            if(type === 'avatar') {
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
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h1 className="text-3xl font-bold border-b border-slate-800 pb-4">Account Settings</h1>

            {/* Profile Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Camera size={20}/> Avatar</h2>
                    <input type="file" onChange={(e) => setAvatar(e.target.files[0])} className="mb-4 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                    <button onClick={() => handleUpdateImages('avatar')} disabled={loading} className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">Upload Avatar</button>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ImageIcon size={20}/> Cover Image</h2>
                    <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} className="mb-4 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer" />
                    <button onClick={() => handleUpdateImages('coverImage')} disabled={loading} className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50">Upload Cover</button>
                </div>
            </div>

            {/* Account Info Form */}
            <form onSubmit={handleUpdateAccount} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 space-y-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><User size={20}/> Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-blue-500" value={accountData.fullName} onChange={(e) => setAccountData({...accountData, fullName: e.target.value})} />
                    <input type="email" placeholder="Email Address" className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-blue-500" value={accountData.email} onChange={(e) => setAccountData({...accountData, email: e.target.value})} />
                </div>
                <button type="submit" className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Update Details</button>
            </form>

            {/* Security Section */}
            <form onSubmit={handleUpdatePassword} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 space-y-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Lock size={20}/> Security & Password</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="password" placeholder="Current Password" required className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-red-500" value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} />
                    <input type="password" placeholder="New Password" required className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-green-500" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
                </div>
                <button type="submit" className="bg-red-600 px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2">
                    {loading && <Loader2 className="animate-spin" size={18}/>} Change Password
                </button>
            </form>
        </div>
    )
};

export default Settings;

