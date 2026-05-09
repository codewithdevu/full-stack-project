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
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            {/* Header / Search Placeholder */}
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold border-l-4 border-blue-500 pl-4">Explore Videos</h1>
            </div>

            {/* Video Grid */}
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <div 
                            key={video._id} 
                            onClick={() => navigate(`/video/${video._id}`)}
                            className="bg-slate-800 rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500 transition-all duration-300 shadow-lg"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video overflow-hidden">
                                <img 
                                    src={video.thumbnail} 
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-1 rounded">
                                    {video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60)}` : "10:00"}
                                </span>
                            </div>

                            {/* Info Section */}
                            <div className="p-4 flex gap-3">
                                <img 
                                    src={video.ownerDetails?.avatar || "https://via.placeholder.com/40"} 
                                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                    alt="owner"
                                />
                                <div className="flex flex-col overflow-hidden">
                                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-blue-400 transition">
                                        {video.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">{video.ownerDetails?.username || "Channel Name"}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                                        <span>{video.views} views</span>
                                        <span>•</span>
                                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center mt-20 text-slate-500 italic">
                    No videos found. Be the first to upload!
                </div>
            )}
        </div>
    );

}

export default Home;
