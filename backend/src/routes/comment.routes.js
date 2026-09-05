import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {isVideoPresent} from "../utils/isVideoPresent.js"
import { upload } from "../middlewares/multer.middleware.js";
import { isCommentOwner } from '../middlewares/isOwner.middleware.js';

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(isVideoPresent,addComment);
router.route("/c/:commentId").delete(isCommentOwner,deleteComment).patch(isCommentOwner,updateComment);

export default router