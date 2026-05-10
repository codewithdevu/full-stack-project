import React, { useState } from "react";
import apiClient from "../api/apiConfig";
import { X, Upload, Film, Image as ImageIcon } from "lucide-react";

const UploadVideo = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null; // Agar modal open nahi hai toh kuch mat dikhao

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        if (videoFile) data.append("videoFile", videoFile);
        if (thumbnail) data.append("thumbnail", thumbnail);

        try {
            // Backend route check karna, mostly it is "/videos" for POST
            await apiClient.post("/videos", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Video Uploaded Successfully! 🚀");
            onClose(); // Upload ke baad modal band kar do
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Upload failed. Check console.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Upload className="text-blue-500" /> Upload Video
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* File Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Video File */}
                        <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-4 hover:border-blue-500 transition group">
                            <input 
                                type="file" accept="video/*" required
                                onChange={(e) => setVideoFile(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="text-center space-y-2">
                                <Film className="mx-auto text-slate-500 group-hover:text-blue-500" size={32} />
                                <p className="text-xs text-slate-400">{videoFile ? videoFile.name : "Select Video File"}</p>
                            </div>
                        </div>

                        {/* Thumbnail File */}
                        <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-4 hover:border-green-500 transition group">
                            <input 
                                type="file" accept="image/*" required
                                onChange={(e) => setThumbnail(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="text-center space-y-2">
                                <ImageIcon className="mx-auto text-slate-500 group-hover:text-green-500" size={32} />
                                <p className="text-xs text-slate-400">{thumbnail ? thumbnail.name : "Select Thumbnail"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Text Inputs */}
                    <div className="space-y-4">
                        <input 
                            type="text" placeholder="Video Title" required
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                        <textarea 
                            placeholder="Description" rows="4"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" disabled={uploading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition ${uploading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20'}`}
                    >
                        {uploading ? "Uploading to Cloudinary..." : "Publish Video"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadVideo;