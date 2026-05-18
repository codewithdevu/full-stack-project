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
    // 1. GLOBAL OVERLAY
    <div className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        
        {/* 2. MODAL CONTAINER */}
        {/* max-h ko flexible kiya hai taaki mobile bottom-nav kabhi hide na ho aur modal perfect scale ho */}
        <div className="bg-slate-900 border border-slate-800 w-full max-w-85 xs:max-w-sm rounded-2xl flex flex-col max-h-[calc(100vh-12rem)] sm:max-h-[85vh] mb-16 sm:mb-0 mx-auto shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0 bg-slate-900">
                <h2 className="text-base font-bold flex items-center gap-2 text-slate-100">
                    <Upload size={18} className="text-blue-500" /> Upload Video
                </h2>
                <button 
                    type="button"
                    onClick={onClose} 
                    className="text-slate-400 hover:text-white transition p-1.5 hover:bg-slate-800 rounded-xl"
                >
                    <X size={18} />
                </button>
            </div>

            {/* 3. SCROLLABLE FORM BODY */}
            <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto space-y-4 no-scrollbar bg-slate-900">
                
                {/* File Inputs Group */}
                <div className="space-y-3">
                    {/* Video File Dropzone */}
                    <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-4 hover:border-blue-500 transition group bg-slate-950/20 min-h-20 flex items-center justify-center">
                        <input 
                            type="file" accept="video/*" required
                            onChange={(e) => setVideoFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center text-center space-y-1 w-full pointer-events-none">
                            <Film className="text-slate-500 group-hover:text-blue-500 transition" size={24} />
                            <p className="text-xs text-slate-300 font-semibold truncate max-w-60">
                                {videoFile ? videoFile.name : "Select Video File"}
                            </p>
                        </div>
                    </div>

                    {/* Thumbnail File Dropzone */}
                    <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-4 hover:border-green-500 transition group bg-slate-950/20 min-h-20 flex items-center justify-center">
                        <input 
                            type="file" accept="image/*" required
                            onChange={(e) => setThumbnail(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center text-center space-y-1 w-full pointer-events-none">
                            <ImageIcon className="text-slate-500 group-hover:text-green-500 transition" size={24} />
                            <p className="text-xs text-slate-300 font-semibold truncate max-w-60">
                                {thumbnail ? thumbnail.name : "Select Thumbnail"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                    <input 
                        type="text" placeholder="Video Title" required
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500 text-slate-100 placeholder:text-slate-500 transition"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                    
                    <textarea 
                        placeholder="Description" rows="2"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500 text-slate-100 placeholder:text-slate-500 transition resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-1">
                    <button 
                        type="submit" disabled={uploading}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.99] ${
                            uploading 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10'
                        }`}
                    >
                        {uploading ? "Uploading to Cloudinary..." : "Publish Video"}
                    </button>
                </div>
            </form>
        </div>
    </div>
);
};

export default UploadVideo;