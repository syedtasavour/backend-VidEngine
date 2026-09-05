import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { Aggregate } from "mongoose";
// import { Video } from "../models/video.model.js";

const addComment = asyncHandler(async (req, res) => {
  // Retrieve video ID from parameters
  // Obtain user ID from req.user
  // Check if the video ID is valid
  // Verify that the video exists in the database
  // Retrieve content from the body and validate it
  // Then save it to the database
  if (!req.body.content) {
    throw new ApiError(400, "Comment field is required");
  }
  const response = await Comment.create({
    content: req.body.content,
    video: req.params.videoId,
    owner: req.user._id,
  });
  if (!response) {
    throw new ApiError(500, "Failed to post comment. Please try again later.");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        response,
        "Your comment has been added successfully!"
      )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const response = await Comment.findByIdAndDelete(req.params.commentId);
  return res
    .status(200)
    .json(
      new ApiResponse(200, response, "Comment has been deleted successfully.")
    );
});

const getVideoComments = asyncHandler(async (req, res) => {
  const commentsAggregate =  Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(req.params.videoId),
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        video: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  const options= {
    page: req.query.page,
    limit: req.query.limit
  }
  const comments = await Comment.aggregatePaginate(commentsAggregate,options)

  return res.status(302).json(new ApiResponse(302, comments, "Comments retrieved successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  if(!req.body.content){
    throw new ApiError(400, null, "Please provide valid comment content to update your comment.")
  }
  let comment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    {$set: {content: req.body.content}}
  )
  if(!comment){
    throw new ApiError(500, null, "Failed to update comment. Please try again later.")
  }
  comment = await Comment.findById(comment._id).select("content video  owner createdAt updatedAt")
  return res.status(200).json(new ApiResponse(200, comment, "Your comment has been updated successfully!"));
});

export { addComment, deleteComment, getVideoComments, updateComment };
