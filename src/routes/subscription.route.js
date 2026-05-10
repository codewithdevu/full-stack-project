import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscirbedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()

router.use(verifyJWT)

router
    .route("/c/:subscriberId")
    .get(getSubscirbedChannels)
    
    router.route("/u/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription)

export default router