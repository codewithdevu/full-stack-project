import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiConfig.js";
import React, {useState,  useEffect} from "react";


const Home = () => {
    const [videos , setVideos] = useState([]);
    const [loading , setLoading] = useState(true);
    const navigate = useNavigate(); 


    useEffect(() => {
        const fetchAllVideos = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/videos?page=1&limit=12");

                // console.log("videos from backend: " , response.data);
                
        
                if(response.data?.data?.docs){
                    setVideos(response.data.data.docs)
                }
            } catch (error) {
                console.error("Error while fetching the videos: " ,error);
            } finally{
                setLoading(false);
            }
        };
        fetchAllVideos();
    }, []);

    if(loading) return <div className="text-white text-center mt-20">Loading Feed...</div>
    
return (
        <div className="min-h-screen bg-slate-900 text-white p-3 md:p-8 pb-24 lg:pb-8 select-none">
            <div className="max-w-7xl mx-auto">
                
                {/* Header / Search Placeholder Area */}
                <div className="mb-6 md:mb-8 flex justify-between items-center pl-1">
                    <h1 className="text-xl md:text-2xl font-extrabold border-l-4 border-blue-500 pl-3 tracking-tight text-slate-100">
                        Explore Videos
                    </h1>
                </div>

                {/* 🟢 VIDEOS CONTAINER GRID: Adaptive columns optimized down to 375px */}
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {videos.map((video) => {
                            // 💡 Pro Sizing Formatting: Single digit minutes/seconds to double digits format helper
                            const minutes = Math.floor((video.duration || 0) / 60);
                            const seconds = Math.floor((video.duration || 0) % 60).toString().padStart(2, "0");
                            
                            return (
                                <div 
                                    key={video._id} 
                                    onClick={() => navigate(`/video/${video._id}`)}
                                    className="bg-slate-800/50 rounded-2xl overflow-hidden cursor-pointer group border border-slate-800 hover:border-blue-500/50 transition-all duration-300 shadow-md flex flex-col justify-between"
                                >
                                    {/* Thumbnail Frame */}
                                    <div className="relative aspect-video overflow-hidden bg-black shrink-0 border-b border-slate-800/40">
                                        <img 
                                            src={video.thumbnail} 
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                        />
                                        {/* Sleek Custom Duration Badge */}
                                        <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700/30 tracking-wider">
                                            {video.duration ? `${minutes}:${seconds}` : "10:00"}
                                        </span>
                                    </div>

                                    {/* Info Section Meta details layout */}
                                    <div className="p-3.5 flex gap-3 items-start flex-1">
                                        <img 
                                            src={video.ownerDetails?.avatar || "https://via.placeholder.com/40"} 
                                            className="w-9 h-9 rounded-full object-cover border border-slate-700/50 shrink-0"
                                            alt="owner"
                                        />
                                        <div className="flex flex-col overflow-hidden min-w-0 w-full">
                                            <h3 className="font-bold text-sm text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors duration-200">
                                                {video.title}
                                            </h3>
                                            
                                            <p className="text-xs text-slate-400 mt-1.5 font-medium truncate">
                                                {video.ownerDetails?.username || "Channel Name"}
                                            </p>
                                            
                                            {/* Views Metrics row */}
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 font-medium">
                                                <span className="truncate">{video.views?.toLocaleString() || 0} views</span>
                                                <span className="text-slate-700">•</span>
                                                <span className="shrink-0">{new Date(video.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center mt-20 text-slate-500 italic text-sm md:text-base border border-dashed border-slate-800 py-16 rounded-2xl">
                        No videos found. Be the first to upload, bhai!
                    </div>
                )}
            </div>
        </div>
    );

}

