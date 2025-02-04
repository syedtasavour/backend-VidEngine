import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { isVideoLiked, isCommentLiked, isTweetLiked } from '../middlewares/isOwner.middleware.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(isVideoLiked,toggleVideoLike);
router.route("/toggle/c/:commentId").post(isCommentLiked, toggleCommentLike);
router.route("/toggle/t/:tweetId").post(isTweetLiked,toggleTweetLike);
router.route("/videos").post(getLikedVideos);

export default router