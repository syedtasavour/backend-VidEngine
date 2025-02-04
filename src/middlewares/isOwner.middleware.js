import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { Comment } from "../models/comment.model.js";
import { mongoose } from "mongoose";
import { Tweet } from "../models/tweet.model.js";

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
    throw new ApiError(403, null,"Unauthorized access");
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
    throw new ApiError(403, null,"Unauthorized access");
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
    throw new ApiError(403, null,"Unauthorized access");
  }
  // console.log(commentOwner);

  next();
});

const isTweetOwner = asyncHandler(async(req,_ , next)=>{
  if (!mongoose.Types.ObjectId.isValid(req.params.tweetId)) {
    throw new ApiError(404,null, "The provided tweet ID is invalid.");
  }

  const tweetOwner = await Tweet.findById(req.params.tweetId);
  if (!tweetOwner) {
    throw new ApiError(404, null,"tweet does not exist");
  }
  if (tweetOwner.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, null,"Unauthorized access");
  }
  

  next();
})

export { isOwner, isPlaylistOwner, isCommentOwner , isTweetOwner };
