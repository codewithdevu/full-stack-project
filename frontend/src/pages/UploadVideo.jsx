import React, { useState, useEffect } from "react";
import { X, Upload, Film, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import apiClient from "../api/apiConfig";

const MAX_TITLE_CHARS = 100;
const MAX_DESC_CHARS = 5000;
const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB Vercel limit

const UploadVideo = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    
    // Live previews URLs
    const [videoPreview, setVideoPreview] = useState("");
    const [thumbPreview, setThumbPreview] = useState("");

    // Drag states
    const [isDragVideo, setIsDragVideo] = useState(false);
    const [isDragThumb, setIsDragThumb] = useState(false);

    // Upload & safety flows
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    useEffect(() => {
        return () => {
            if (videoPreview) URL.revokeObjectURL(videoPreview);
            if (thumbPreview) URL.revokeObjectURL(thumbPreview);
        };
    }, [videoPreview, thumbPreview]);

    if (!isOpen) return null;

    const handleResetAndClose = () => {
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        if (thumbPreview) URL.revokeObjectURL(thumbPreview);
        setFormData({ title: '', description: '' });
        setVideoFile(null);
        setThumbnail(null);
        setVideoPreview("");
        setThumbPreview("");
        setUploadProgress(0);
        setShowCloseConfirm(false);
        onClose();
    };

    const handleCloseAttempt = () => {
        if (uploading) return;
        const hasInput = formData.title.trim() || formData.description.trim() || videoFile || thumbnail;
        if (hasInput) {
            setShowCloseConfirm(true);
        } else {
            handleResetAndClose();
        }
    };

    const handleVideoSelect = (file) => {
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            alert(`File exceeds Vercel's 4.5MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
            return;
        }
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        
        if (!formData.title.trim()) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            setFormData(prev => ({ ...prev, title: cleanName.slice(0, MAX_TITLE_CHARS) }));
        }
    };

    const handleThumbSelect = (file) => {
        if (!file) return;
        if (thumbPreview) URL.revokeObjectURL(thumbPreview);
        setThumbnail(file);
        setThumbPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploading) return;

        setUploading(true);
        setUploadProgress(15);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        if (videoFile) data.append("videoFile", videoFile);
        if (thumbnail) data.append("thumbnail", thumbnail);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => (prev >= 90 ? 90 : prev + 10));
            }, 600);

            await apiClient.post("/videos", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            clearInterval(progressInterval);
            setUploadProgress(100);
            alert("Video Uploaded Successfully! 🚀");
            handleResetAndClose(); 
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Upload failed. The server rejected the request payload.");
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    return (
        /* GLOBAL FIXED OVERLAY */
        <div className="fixed inset-0 w-screen h-screen bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none overflow-y-auto">
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeInUpModal {
                    from {
                        opacity: 0;
                        transform: scale(0.97) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-modal-entry {
                    animation: fadeInUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />

            {/* COMPACT MODAL CONTAINER */}
            <div className="relative w-full max-w-md my-auto group animate-modal-entry">
                
                {/* Back-glow outline effect */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-md opacity-25 pointer-events-none" />

                {/* MAIN MODAL BOX */}
                <div className="relative bg-slate-950 border border-slate-900 shadow-[0_25px_60px_rgba(0,0,0,0.85)] rounded-2xl flex flex-col overflow-hidden max-h-[95vh]">
                    
                    {/* Sticky Header */}
                    <div className="relative z-10 flex justify-between items-center p-4 border-b border-slate-900 shrink-0 bg-slate-950/80 backdrop-blur-md">
                        <h2 className="text-xs font-bold flex items-center gap-2 text-slate-100 uppercase tracking-wider">
                            <Upload className="w-3.5 h-3.5 text-indigo-400" /> Upload Video
                        </h2>
                        <button 
                            type="button"
                            disabled={uploading}
                            onClick={handleCloseAttempt} 
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent hover:border-slate-800 rounded-lg transition-all duration-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Progress Loader Bar */}
                    {uploadProgress > 0 && (
                        <div className="w-full h-0.5 bg-slate-900 relative z-20 shrink-0">
                            <div 
                                className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    {/* VERTICAL FORM BODY */}
                    <form onSubmit={handleSubmit} className="relative z-10 flex-1 p-5 space-y-4 overflow-y-auto no-scrollbar">
                        
                        {/* --- COMPACT HORIZONTAL GRID (SIDE-BY-SIDE DESIGN) --- */}
                        <div className="grid grid-cols-2 gap-3.5">
                            
                            {/* Left Column: Video Dropzone */}
                            <div className="min-w-0">
                                {!videoPreview ? (
                                    <div 
                                        onDragOver={(e) => { e.preventDefault(); setIsDragVideo(true); }}
                                        onDragLeave={() => setIsDragVideo(false)}
                                        onDrop={(e) => { e.preventDefault(); setIsDragVideo(false); handleVideoSelect(e.dataTransfer.files[0]); }}
                                        className={`relative border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-slate-900/10 h-24
                                            ${isDragVideo ? "border-indigo-500 bg-indigo-500/5" : "border-slate-900 hover:border-slate-800"}
                                        `}
                                    >
                                        {/* title="" blocks native browser tooltips */}
                                        <input 
                                            type="file" accept="video/*" required title=""
                                            onChange={(e) => handleVideoSelect(e.target.files[0])}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <Film className="w-4 h-4 text-slate-500 mb-1" />
                                        <p className="text-[10px] font-bold text-slate-200">Select Video File</p>
                                    </div>
                                ) : (
                                    /* Video selected chip */
                                    <div className="flex flex-col justify-between bg-slate-900/40 border border-slate-900 p-2.5 rounded-xl text-[10px] h-24">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <Film className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                            <span className="truncate text-slate-300 font-mono text-[9px]">{videoFile?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-900/60">
                                            <span className="text-slate-500 font-mono text-[8px]">{(videoFile?.size / (1024 * 1024)).toFixed(2)} MB</span>
                                            <button 
                                                type="button" disabled={uploading}
                                                onClick={() => { setVideoFile(null); setVideoPreview(""); }}
                                                className="text-[9px] text-rose-400 hover:text-rose-350 font-bold focus:outline-none"
                                            >
                                                Replace
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Thumbnail Dropzone */}
                            <div className="min-w-0">
                                {!thumbPreview ? (
                                    <div 
                                        onDragOver={(e) => { e.preventDefault(); setIsDragThumb(true); }}
                                        onDragLeave={() => setIsDragThumb(false)}
                                        onDrop={(e) => { e.preventDefault(); setIsDragThumb(false); handleThumbSelect(e.dataTransfer.files[0]); }}
                                        className={`relative border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-slate-900/10 h-24
                                            ${isDragThumb ? "border-purple-500 bg-purple-500/5" : "border-slate-900 hover:border-slate-800"}
                                        `}
                                    >
                                        {/* title="" blocks native browser tooltips */}
                                        <input 
                                            type="file" accept="image/*" required title=""
                                            onChange={(e) => handleThumbSelect(e.target.files[0])}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <ImageIcon className="w-4 h-4 text-slate-500 mb-1" />
                                        <p className="text-[10px] font-bold text-slate-200">Select Thumbnail</p>
                                    </div>
                                ) : (
                                    /* Thumbnail selected chip */
                                    <div className="flex flex-col justify-between bg-slate-900/40 border border-slate-900 p-2.5 rounded-xl text-[10px] h-24">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                            <span className="truncate text-slate-300 font-mono text-[9px]">{thumbnail?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-900/60">
                                            <span className="text-slate-500 font-mono text-[8px]">{(thumbnail?.size / 1024).toFixed(0)} KB</span>
                                            <button 
                                                type="button" disabled={uploading}
                                                onClick={() => { setThumbnail(null); setThumbPreview(""); }}
                                                className="text-[9px] text-rose-400 hover:text-rose-350 font-bold focus:outline-none"
                                            >
                                                Replace
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* --- 3. INPUT FIELDS (Tighter Padding) --- */}
                        <div className="space-y-3.5">
                            
                            {/* Video Title */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-0.5 uppercase tracking-wider">
                                    <span>Video Title</span>
                                    <span className="font-mono">{formData.title.length}/{MAX_TITLE_CHARS}</span>
                                </div>
                                <input 
                                    type="text" required placeholder="Add video title..."
                                    maxLength={MAX_TITLE_CHARS}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-all"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            {/* Description Box */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-0.5 uppercase tracking-wider">
                                    <span>Description</span>
                                    <span className="font-mono">{formData.description.length}/{MAX_DESC_CHARS}</span>
                                </div>
                                <textarea 
                                    placeholder="Description" rows="3"
                                    maxLength={MAX_DESC_CHARS}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-all resize-none no-scrollbar h-20"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                        </div>

                        {/* --- 4. SUBMIT ACTION BUTTON --- */}
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className="relative w-full group overflow-hidden rounded-xl py-2.5 text-xs font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {uploading ? (
                                    <span className="absolute inset-0 w-full h-full bg-slate-900 border border-slate-800" />
                                ) : (
                                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
                                )}
                                <span className="relative flex items-center justify-center gap-1.5 text-white uppercase tracking-wider">
                                    {uploading ? (
                                        <>
                                            <RefreshCw className="animate-spin w-3.5 h-3.5" /> Uploading ({uploadProgress}%)
                                        </>
                                    ) : (
                                        "Publish Video"
                                    )}
                                </span>
                            </button>
                        </div>

                    </form>
                </div>

                {/* --- DISCARD CONFIRMATION MODAL POPUP --- */}
                {showCloseConfirm && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
                        <div className="bg-slate-950 border border-slate-900 w-full max-w-sm rounded-xl p-5 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="mx-auto p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full w-fit">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Discard changes?</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                                    Your draft details and selected media will be lost. This cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowCloseConfirm(false)}
                                    className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetAndClose}
                                    className="flex-1 py-2 bg-rose-500/15 text-rose-450 hover:bg-rose-600 hover:text-white border border-rose-500/20 hover:border-transparent rounded-xl transition duration-300 font-bold"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default UploadVideo;