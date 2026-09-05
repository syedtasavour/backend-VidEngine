import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const liked = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });


  const likedData = await Like.findById(liked._id).select("likedBy video");

  if (!likedData) {
    throw new ApiError(
      500,
      null,
      "Failed to toggle like for the video. Please try again later."
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likedData, "Video like toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const commentLiked = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });
  const likedData = await Like.findById(commentLiked._id).select(
    "likedBy comment"
  );

  if (!likedData) {
    throw new ApiError(
      500,
      null,
      "Failed to toggle like for the comment. Please try again later."
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likedData, "Comment like toggled successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const tweetLiked = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  const likedData = await Like.findById(tweetLiked._id).select("likedBy tweet");

  if (!likedData) {
    throw new ApiError(
      500,
      null,
      "Failed to toggle like for the tweet. Please try again later."
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likedData, "Tweet like toggled successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedAggregate = Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
        pipeline: [
          {
            $match: {
              isPublished: true, // Only get videos that are published
            },
          },
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedVideos: {
          $first: "$likedVideos",
        },
      },
    },
    {
      $project: {
        likedBy: 1,
        createdAt: 1,
        likedVideos: 1,
      },
    },
  ]);
  const options = {
    page: parseInt(req.query?.page) || 1,
    limit: parseInt(req.query?.limit) || 10
};
    const likedVideos = await Like.aggregatePaginate(likedAggregate,options)
    if(likedVideos){
        if (likedVideos.docs.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, likedVideos, "User has not liked any video"));
        }
    }
    return res
    .status(202)
    .json(
      new ApiResponse(202, likedVideos, "Liked videos retrieved successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
