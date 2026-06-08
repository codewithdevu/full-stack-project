import React, { useEffect, useState } from "react";
import apiClient from "../api/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import { Bell, BellRing, Play, Users, Video, Sparkles, Compass } from "lucide-react";

const MyChannel = () => {
    const { username } = useParams();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchChannelData = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true)

            const response = await apiClient.get(`/users/c/${username}`);
            const channelInfo = response.data?.data;

            if (channelInfo) {
                setChannel(channelInfo);
                const videoResponse = await apiClient.get(`/videos?userId=${channelInfo._id}`);

                if (videoResponse.data?.data) {
                    setVideos(videoResponse.data.data.docs || videoResponse.data.data);
                }
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

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-indigo-400 animate-spin">
                        <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading Channel Archive...</span>
                </div>
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-rose-400">
                        <Video className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">Channel Unreachable</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        The requested channel has either been deactivated or is currently offline. Verify the username address and try again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 lg:pb-12 relative overflow-hidden font-sans select-none selection:bg-indigo-500/30">
            
            {/* Background Ambient Lighting Halos */}
            <div className="absolute top-[20vh] right-1/4 w-112.5-[450px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/4 w-100400px] bg-purple-500/5 rounded-full blur-[110px] pointer-events-none z-0" />

            {/* 1. Dynamic Cover Artwork Banner */}
            <div className="h-44 md:h-64 w-full bg-slate-950 overflow-hidden relative border-b border-slate-900/80 z-0">
                <img
                    src={channel.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1500"}
                    className="w-full h-full object-cover opacity-35"
                    alt="Cover artwork banner"
                />
                {/* Seamless vignette layout fade */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
            </div>

            {/* 2. Channel Header Info Block */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-20 md:-mt-16 relative z-10 space-y-6">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6">
                    
                    {/* Glowing Avatar Frame */}
                    <div className="relative shrink-0 p-0.5 bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-2xl shadow-black/80">
                        <img
                            src={channel.avatar}
                            className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-slate-950 object-cover shrink-0"
                            alt={`${channel.fullName} avatar`}
                        />
                    </div>

                    {/* Channel Metadata Panel */}
                    <div className="flex-1 text-center md:text-left pb-1.5 min-w-0 w-full space-y-1.5">
                        <div className="flex items-center justify-center md:justify-start gap-2.5">
                            <h1 className="text-xl md:text-3xl font-bold text-slate-100 tracking-tight truncate">
                                {channel.fullName}
                            </h1>
                            <Sparkles className="w-4 h-4 text-pink-400 shrink-0 hidden sm:inline-block animate-pulse" />
                        </div>

                        {/* Developer-style Subscription Info Strip */}
                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-[11px] md:text-xs font-semibold whitespace-nowrap overflow-x-auto no-scrollbar py-0.5">
                            <span className="text-indigo-400">@{channel.username}</span>
                            <span className="text-slate-800">•</span>
                            <span className="text-slate-300 inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                {channel.subscriberCount || 0} Subscribers
                            </span>
                            <span className="text-slate-800">•</span>
                            <span className="text-slate-400">
                                {channel.channelSubscriberToCount} Subscribed
                            </span>
                        </div>
                    </div>

                    {/* Interactive Subscribed Action Toggle */}
                    <div className="pb-1.5 w-full md:w-auto mt-3 md:mt-0 shrink-0">
                        <button
                            onClick={handleSubscribe}
                            className={`w-full md:w-auto px-8 py-3 md:py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-[0.98] border ${
                                (channel.isSubscribed || channel.issubscribed)
                                    ? "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700/80 hover:bg-slate-900"
                                    : "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white border-transparent shadow-lg shadow-indigo-500/10"
                            }`}
                        >
                            {(channel.isSubscribed || channel.issubscribed) ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>

                </div>
            </div>

            {/* 3. Catalog Tab Panel */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 mt-10 md:mt-12 relative z-10 space-y-6">
                
                {/* Minimalist Tabs Header */}
                <div className="border-b border-slate-900 flex justify-center md:justify-start">
                    <button className="border-b-2 border-indigo-500 pb-3 px-5 font-bold text-xs tracking-wider text-indigo-400 uppercase">
                        Video Directory
                    </button>
                </div>

                {/* --- VIDEO CATALOG SHELF --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                    {videos.length > 0 ? (
                        videos.map((video) => (
                            <div
                                key={video._id}
                                onClick={() => navigate(`/video/${video._id}`)}
                                className="group flex flex-col cursor-pointer rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/40 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                            >
                                {/* Thumbnail Frame with Play Indicator */}
                                <div className="aspect-video rounded-t-2xl overflow-hidden relative border-b border-slate-900/85">
                                    <img
                                        src={video.thumbnail}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={video.title}
                                    />
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                                            <Play className="w-5 h-5 fill-indigo-400/30 translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Video Metadata Layout */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-semibold text-xs text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-semibold font-mono">
                                        <span>{video.views?.toLocaleString()} views</span>
                                        <span>•</span>
                                        <span>{new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center text-center py-24 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-xl mx-auto">
                            <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-4 text-slate-500">
                                <Compass className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-semibold text-slate-300">No Content Uploaded</h3>
                            <p className="text-[11px] text-slate-500 mt-2 max-w-xs leading-relaxed">
                                This channel does not contain any transcoded assets yet. Check back later for upcoming releases.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default MyChannel;