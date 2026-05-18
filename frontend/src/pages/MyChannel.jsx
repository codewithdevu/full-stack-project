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
            if (!isSilent) setLoading(false);

        }

    };

    useEffect(() => {
        if (username) {
            fetchChannelData();
        }
    }, [username])

    const handleSubscribe = async () => {
        try {
            if (!channel?._id) return;

            setChannel((prev) => {
                const currentStatus = prev.isSubscribed || prev.issubscribed || false;
                const nextStatus = !currentStatus;

                const currentCount = Number(prev.subscriberCount) || 0;
                const nextCount = currentStatus
                    ? Math.max(0, currentCount - 1)
                    : currentCount + 1;

                return {
                    ...prev,
                    isSubscribed: nextStatus,
                    issubscribed: nextStatus, 
                    subscriberCount: nextCount
                };
            });

            await apiClient.post(`/subscriptions/u/${channel._id}`);

        } catch (error) {
            console.error("Error subscribing to channel: ", error);
            fetchChannelData(true);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Channel...</div>;
    if (!channel) return <div className="text-white text-center mt-20">Channel not found!</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-24 lg:pb-10">
            {/* 1. Banner Section */}
            <div className="h-36 md:h-64 w-full bg-slate-800 overflow-hidden relative border-b border-slate-800/40">
                <img
                    src={channel.coverImage || "https://via.placeholder.com/1500x400"}
                    className="w-full h-full object-cover opacity-60"
                    alt="cover"
                />
            </div>

            {/* 2. Channel Header Info - 375px Fluid Stack */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 md:-mt-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                    {/* Avatar */}
                    <img
                        src={channel.avatar}
                        className="w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-slate-900 object-cover shadow-2xl shrink-0 shadow-black/60"
                        alt="avatar"
                    />

                    {/* Channel Meta Information */}
                    <div className="flex-1 text-center md:text-left pb-1 min-w-0 w-full">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-100 tracking-tight truncate">{channel.fullName}</h1>

                        {/* 🟢 FIXED: Mobile aur Laptop dono par ek hi line mein perfectly centered */}
                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 mt-2 text-xs md:text-sm font-medium whitespace-nowrap overflow-x-auto no-scrollbar">
                            <span className="text-slate-300">@{channel.username}</span>

                            <span className="text-slate-600">•</span>

                            <span className="text-slate-200">
                                {channel.subscriberCount || 0} Subscribers
                            </span>

                            <span className="text-slate-600">•</span>

                            <span className="text-slate-400">
                                {channel.channelSubscriberToCount} Subscribed
                            </span>
                        </div>

                    </div>


                    {/* Subscribe Button Layer inside return container */}
                    <div className="pb-1 w-full md:w-auto mt-2 md:mt-0">
                        <button
                            onClick={handleSubscribe}
                            className={`w-full md:w-auto px-8 py-3 md:py-2.5 rounded-xl md:rounded-full text-sm font-extrabold transition-all duration-200 active:scale-[0.98] ${(channel.isSubscribed || channel.issubscribed)
                                    ? "bg-slate-800 text-slate-400 border border-slate-700 font-bold"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/10"
                                }`}
                        >
                            {(channel.isSubscribed || channel.issubscribed) ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Tabs & Video Shelf */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 md:mt-12">
                <div className="border-b border-slate-800/80 mb-6 md:mb-8 flex justify-center md:justify-start">
                    <button className="border-b-2 border-blue-500 pb-3 px-6 font-bold text-sm tracking-wide text-blue-500 uppercase">
                        Videos
                    </button>
                </div>

                {/* 🟢 DYNAMIC VIDEO GRID - Optimized down to 375px */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {videos.length > 0 ? (
                        videos.map((video) => (
                            <div
                                key={video._id}
                                onClick={() => navigate(`/video/${video._id}`)}
                                className="cursor-pointer group bg-slate-800/10 p-2 rounded-2xl border border-transparent hover:bg-slate-800/30 hover:border-slate-800/60 transition-all duration-200"
                            >
                                {/* Thumbnail Frame */}
                                <div className="aspect-video rounded-xl overflow-hidden mb-2.5 relative border border-slate-800/40">
                                    <img
                                        src={video.thumbnail}
                                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                                        alt="thumbnail"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                                        <Play fill="white" className="text-white" size={32} />
                                    </div>
                                </div>

                                {/* Video Titles Metadata */}
                                <div className="px-1">
                                    <h3 className="font-bold text-sm text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition">
                                        {video.title}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                        {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 text-slate-500 text-sm italic">
                            This channel has no videos yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyChannel;