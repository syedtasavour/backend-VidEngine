import { Router } from 'express';

import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { isTweetOwner } from '../middlewares/isOwner.middleware.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(isTweetOwner, updateTweet).delete(isTweetOwner,deleteTweet);

export default router