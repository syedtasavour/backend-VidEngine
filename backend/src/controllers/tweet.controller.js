import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const tweet = await Tweet.create({
    content: content,
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(500, null, "Failed to post tweet. Please try again.");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet posted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId, page, limit } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(404, "The provided tweet ID is invalid.");
    }
  const tweetAggregate = Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $project: {
        content: 1,
        owner: 1,
        tweets: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  const options = {
    page: page,
    limit: limit,
  };

const tweet = await Tweet.aggregatePaginate(tweetAggregate, options);
     
if(!tweet.docs.length){
    return res.status(404).json(new ApiResponse(404, tweet, "No tweets found for this user"));
}

return res.status(200).json(new ApiResponse(200, tweet, "Tweets retrieved successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const response = await Tweet.findByIdAndUpdate(req.params.tweetId, {
    $set: { content: req.body.content },
  });
  if (!response) {
    throw new ApiError(
      500,
      null,
      "Failed to update tweet. Please try again later."
    );
  }
  return res
    .status(202)
    .json(new ApiResponse(202, response, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const response = await Tweet.findByIdAndDelete(req.params.tweetId);
  if (!response) {
    throw new ApiError(
      500,
      null,
      "Failed to delete tweet. Please try again later."
    );
  }

  
return res
    .status(200)
    .json(new ApiResponse(200, { deleted: true }, "Tweet successfully removed from your timeline"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
