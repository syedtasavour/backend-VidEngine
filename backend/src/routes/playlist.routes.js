import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { isPlaylistOwner } from '../middlewares/isOwner.middleware.js';

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:name/:description").post(createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(isPlaylistOwner,updatePlaylist)
    .delete(isPlaylistOwner,deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(isPlaylistOwner,addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(isPlaylistOwner,removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router