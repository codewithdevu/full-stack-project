import React, { useEffect, useState } from "react";
import apiClient from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { ThumbsUp } from "lucide-react";

const LikedVideos = () => {
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/likes/videos`);
                const validVideos = (response.data?.data || []).filter(item => item.video)
                setLikedVideos(validVideos);
            } catch (error) {
                console.error("Error fetching liked videos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLikedVideos();
    }, [])

    if (loading) return <div className="text-white text-center mt-20">Loading Liked Videos...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <ThumbsUp className="text-blue-500" /> Liked Videos
                </h1>

                {likedVideos.length === 0 ? (
                    <div className="text-center text-slate-500 mt-20">No liked videos yet.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {likedVideos.map((item) => (
                            <div
                                key={item._id}
                                // Agar item.video undefined hai toh navigate nahi karega
                                onClick={() => item.video?._id && navigate(`/video/${item.video._id}`)}
                                className="cursor-pointer group"
                            >
                                <img
                                    src={item.video?.thumbnail || "https://via.placeholder.com/160x90"}
                                    className="aspect-video rounded-xl object-cover border border-slate-800 group-hover:border-blue-500 transition"
                                />
                                <h3 className="font-semibold mt-2 line-clamp-2">
                                    {item.video?.title || "Deleted Video"}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {item.video?.ownerDetails?.fullName || "Unknown Creator"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LikedVideos;