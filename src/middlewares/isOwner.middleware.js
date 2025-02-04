import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { Comment } from "../models/comment.model.js";
import { mongoose } from "mongoose";

const isOwner = asyncHandler(async (req, _, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) {
    throw new ApiError(400, "The provided video ID is invalid.");
  }
  //   }
  const { videoId } = req.params;

  const check = await Video.findById(videoId);
  if (!check) {
    throw new ApiError(404, "Video does not exist");
  }

  // Authorization check
  if (req.user._id.toString() !== check.owner.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }
  next();
});
const isPlaylistOwner = asyncHandler(async (req, _, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.playlistId)) {
    throw new ApiError(400, "The provided playlist ID is invalid.");
  }
  const playListOwner = await Playlist.findById(req.params.playlistId);
  if (!playListOwner) {
    throw new ApiError(404, "Playlist does not exist");
  }

  if (playListOwner.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }
  next();
});
const isCommentOwner = asyncHandler(async (req, _, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
    throw new ApiError(404, "The provided comment ID is invalid.");
  }

  const commentOwner = await Comment.findById(req.params.commentId);
  if (!commentOwner) {
    throw new ApiError(404, "Comment does not exist");
  }
  if (commentOwner.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }
  console.log(commentOwner);

  next();
});

export { isOwner, isPlaylistOwner, isCommentOwner };
