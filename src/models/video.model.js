import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String, // AWS S3 original video backup URL
            required: true,
        },
        hlsMasterUrl: {
            type: String, // 🟢 NEW: AWS S3 master.m3u8 playlist URL for HLS streaming
            default: "",
        },
        thumbnail: {
            type: String, // Cloudinary URL
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            default: 0 // Controller upload ke waqt 0 dega, worker baad me ffprobe se exact value update kar dega
        },
        status: {
            type: String, // 🟢 NEW: State tracking for video pipeline
            enum: ["pending", "processing", "processed", "failed"],
            default: "pending",
        },
        error: {
            type: String, // 🟢 NEW: In case transcoding fails, it stores the error message
            default: null,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)