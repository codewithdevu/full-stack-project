import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiConfig.js";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;
            try {
                setLoading(true);
                const response = await apiClient.get(`/videos/search?query=${encodeURIComponent(query)}`);
                setVideos(response.data?.data || []);
            } catch (error) {
                console.error("Search API Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-slate-400 font-medium">Searching for matching videos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white pt-20 px-6 pb-6">
            <h2 className="text-xl font-semibold mb-6">
                Search Results for: <span className="text-blue-400">"{query}"</span>
            </h2>

            {videos.length === 0 ? (
                <div className="text-slate-500 text-center mt-20">
                    No videos found matching this search. Try looking for something else!
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div 
                            key={video._id} 
                            onClick={() => navigate(`/video/${video._id}`)}
                            className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition shadow-lg flex flex-col"
                        >
                            {/* Video Thumbnail Image */}
                            <img 
                                src={video.thumbnail || "https://via.placeholder.com/300x180"} 
                                alt={video.title} 
                                className="w-full h-48 object-cover"
                            />
                            {/* Video Information Layout */}
                            <div className="p-4 flex gap-3 items-start flex-1">
                                <img 
                                    src={video.owner?.avatar || "https://via.placeholder.com/36"} 
                                    className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                                    alt="avatar" 
                                />
                                <div>
                                    <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-tight">{video.title}</h3>
                                    <p className="text-xs text-slate-400 mt-1.5">{video.owner?.fullName || video.owner?.username}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{video.views || 0} views</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;