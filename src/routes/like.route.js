import { Router } from "express";
import mongoose  from "mongoose";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {getLikeVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike} from "../controllers/like.controller.js"
import { toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/videos").post(getLikeVideos)

export default router;