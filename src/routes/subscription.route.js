import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscirbedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()

router.use(verifyJWT)

router
    .route("/c/:channelId")
    .get(getSubscirbedChannels)
    .post(toggleSubscription)

router.route("/u/:subscriberId").get(getUserChannelSubscribers)

export default router