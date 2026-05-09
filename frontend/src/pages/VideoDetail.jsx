import React, { useState, useEffect} from "react";
import apiClient from "../api/apiConfig.js";
import { useParams } from "react-router-dom";
import { ThumbsUp, Share2, MessageSquare } from "lucide-react";


const VideoDetail = () => {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [comment, setComment] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);


    const fetchVideoDetail = async () => {
        try {
            setLoading(true)
            const videoResponse = await apiClient.get(`/videos/${videoId}`);

            console.log("video data: ", videoResponse);

            if (videoResponse.data?.data) {
                setVideo(videoResponse.data.data);
            }

            const commentResponse = await apiClient.get(`/comments/${videoId}`)

            if (commentResponse.data?.data) {
                setComment(commentResponse.data.data.docs || commentResponse.data.data);
            }
        } catch (error) {
            console.error("Error: fetching video details: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (videoId) {
            fetchVideoDetail();
        }
    }, [videoId]);

    const handleLike = async () => {
        try {
            await apiClient.post(`/likes/toggle/v/${videoId}`);
            // count update karne ke liye video refresh
            const updateVideo = await apiClient.get(`/videos/${videoId}`);
            if (updateVideo.data?.data){
                setVideo(updateVideo.data.data);
            }
        } catch (error) {
           console.error("Error: liking video: ", error); 
        }
    };

    const postComment = async () => {
        if(!newComment.trim()) return;
        try {
            await apiClient.post(`/comments/${videoId}` , {content : newComment});
            setNewComment("");
        } catch (error) {
            console.error("Error: posting commment: " , error);
        }
    }

    if (loading) {
        return <div className="text-white text-center mt-20">Loading Video...</div>;
    }
    if (!video) {
        return <div className="text-white text-center mt-20">Video not found!</div>;
    }

        return (
        <div className="min-h-screen bg-slate-900 text-white p-4 lg:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: Video & Info */}
                <div className="lg:col-span-2">
                    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                        <video src={video.videoFile} controls poster={video.thumbnail} className="w-full h-full" autoPlay />
                    </div>

                    <div className="mt-4">
                        <h1 className="text-2xl font-bold">{video.title}</h1>
                        <div className="flex flex-wrap justify-between items-center mt-2 pb-4 border-b border-slate-700 gap-4">
                            <span className="text-slate-400 text-sm">{video.views} views • {new Date(video.createdAt).toLocaleDateString()}</span>
                            <div className="flex gap-3">
                                <button onClick={handleLike} className="flex items-center gap-2 bg-slate-800 px-5 py-2 rounded-full hover:bg-blue-600 transition duration-300">
                                    <ThumbsUp size={18} /> {video.likesCount || 0}
                                </button>
                                <button className="bg-slate-800 px-5 py-2 rounded-full hover:bg-slate-700 transition">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="flex items-center justify-between mt-6 p-4 bg-slate-800/40 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-4">
                            <img src={video.owner?.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500" />
                            <div>
                                <h3 className="font-bold text-lg">{video.owner?.fullName}</h3>
                                <p className="text-slate-400 text-xs">@{video.owner?.username}</p>
                            </div>
                        </div>
                        <button className="bg-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">Subscribe</button>
                    </div>

                    <div className="mt-6 p-4 bg-slate-800/20 rounded-xl text-slate-300 text-sm whitespace-pre-wrap">{video.description}</div>

                    {/* Comments Section */}
                    <div className="mt-10">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20}/> {comment.length} Comments</h2>
                        <div className="flex gap-4 mb-8 items-end">
                            <input 
                                value={newComment} onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..." className="flex-1 bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none py-2" 
                            />
                            <button onClick={postComment} className="bg-blue-600 px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">Post</button>
                        </div>

                        <div className="space-y-6">
                            {comment.map((c) => (
                                <div key={c._id} className="flex gap-4 group">
                                    <img src={c.owner?.avatar || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-blue-400">@{c.owner?.username}</span>
                                            <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm mt-1 text-slate-200">{c.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Suggestions (Empty for now) */}
                <div className="lg:col-span-1">
                    <h3 className="font-bold text-lg mb-4 text-slate-400">Next Videos</h3>
                    <div className="p-10 border border-dashed border-slate-700 rounded-xl text-center text-slate-600">
                        Recommendations coming soon...
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoDetail;