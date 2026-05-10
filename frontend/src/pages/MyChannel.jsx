import React, { useEffect, useState } from "react";
import apiClient from "../api/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import { Bell, BellRing, Play } from "lucide-react";

const MyChannel = () => {
    const { username } = useParams();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchChannelData = async (isSilent = false) => {
        try {
            // setLoading(true);
            if (!isSilent) setLoading(true)
            
            const response = await apiClient.get(`/users/c/${username}`);
            // console.log("response", response);
            const channelInfo = response.data?.data;
            // console.log("response.data?.data" , response.data?.data);
            
            if (channelInfo) {
                setChannel(channelInfo);
                // Channel ke Videos ko fetch karna
                const videoResponse = await apiClient.get(`/videos?userId=${channelInfo._id}`);
                // console.log("videoResponse", videoResponse);
                
                if (videoResponse.data?.data) {
                    setVideos(videoResponse.data.data.docs || videoResponse.data.data);
                }
                // console.log("videoResponse.data?.data" , videoResponse.data?.data);
                
            }
        } catch (error) {
            console.error("Error fetching channel data:", error);
        } finally {
            if (!isSilent)  setLoading(false);
            
        }

    };

    useEffect(() => {
        if (username) {
            fetchChannelData();
        }
    }, [username])

    const handleSubscribe = async () => {
        try {
            if (!channel._id) return;
        
            await apiClient.post(`/subscriptions/u/${channel._id}`);
            await fetchChannelData(true);
        } catch (error) {
            console.error("Error subscribing to channel: ", error)
        }
    }

    if (loading) return <div className="text-white text-center mt-20">Loading Channel...</div>;
    if (!channel) return <div className="text-white text-center mt-20">Channel not found!</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-10">
            {/* 1. Banner Section */}
            <div className="h-48 md:h-64 w-full bg-slate-800 overflow-hidden relative">
                <img
                    src={channel.coverImage || "https://via.placeholder.com/1500x400"}
                    className="w-full h-full object-cover opacity-60"
                    alt="cover"
                />
            </div>

            {/* 2. Channel Header Info */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    <img
                        src={channel.avatar}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-900 object-cover shadow-2xl"
                        alt="avatar"
                    />
                    <div className="flex-1 text-center md:text-left pb-2">
                        <h1 className="text-3xl md:text-4xl font-bold">{channel.fullName}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-3 text-slate-400 mt-2 text-sm">
                            <span>@{channel.username}</span>
                            <span>•</span>
                            <span className="text-white font-medium">{channel.subscriberCount || 0} Subscribers</span>

                            <span>•</span>
                            <span>{channel.channelSubscriberToCount} Subscribed</span>
                        </div>
                    </div>
                    <div className="pb-2">
                        <button
                            onClick={handleSubscribe}
                            className={`px-8 py-2.5 rounded-full font-bold transition-all duration-300 ${channel.issubscribed
                                    ? "bg-slate-700 text-slate-300 border border-slate-600" // Subscribed state
                                    : "bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/10" // Not subscribed state
                                }`}
                        >
                            {/* Button ka text condition ke hisab se badlega */}
                            {channel.issubscribed ? "Subscribed" : "Subscribe"}
                            {/* {console.log(channel.issubscribed)} */}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Tabs (Videos Section) */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 mt-10">
                <div className="border-b border-slate-800 mb-8">
                    <button className="border-b-2 border-blue-500 pb-4 px-6 font-bold text-blue-500">Videos</button>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.length > 0 ? (
                        videos.map((video) => (
                            <div
                                key={video._id}
                                onClick={() => navigate(`/video/${video._id}`)}
                                className="cursor-pointer group"
                            >
                                <div className="aspect-video rounded-xl overflow-hidden mb-3 relative">
                                    <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                        <Play className="fill-white" size={40} />
                                    </div>
                                </div>
                                <h3 className="font-bold text-sm line-clamp-2">{video.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">{video.views} views • {new Date(video.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-slate-500 italic text-lg">
                            This channel has no videos yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyChannel;