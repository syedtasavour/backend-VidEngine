import mongoose, { Mongoose, Schema } from "mongoose";
import { Video } from "../models/video.model.js";
// import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  destroyImageOnCloudinary,
  destroyVideoOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  // const videos = await Video.find({ owner: userId })

  if (!userId) {
    throw new ApiError(406, "User ID not found! Please provide a valid ID.");
  }
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "asc" ? 1 : -1; // asc = 1, desc = -1
  } else {
    sort.createdAt = -1; // Default: Latest Videos Pehle
  }
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const aggregateQuery  =  Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        isPublished: true,
      },
    },

    {
      $sort: sort,
    },

    {
      $lookup: {
        from: "videos",
        localField: "owner",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $unwind: {
        path: "$videos",
        preserveNullAndEmptyArrays: true, // In case some videos don't have an owner record
      },},

    {
      $project: {
        videoFile: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        "ownerDetails.username": 1,
      },
    },
  ]);
   // Pagination options
   const options = {
    page: pageNumber,   // Current page
    limit: limitNumber, // Number of items per page
  };

 
    const result = await Video.aggregatePaginate(aggregateQuery, options);
   
  

  return res
    .status(200)
    .json(new ApiResponse(200, result, "video fetched sucessfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  // get user data from frontend
  // validation - not empty
  // check for video, check for thumbnail
  // upload them to cloudninary
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for video creation
  // return response
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  const uploadVideo = await uploadOnCloudinary(videoLocalPath);

  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!uploadThumbnail) {
    throw new ApiError(400, "Thumbnail file upload failed");
  }
  const video = await Video.create({
    videoFile: uploadVideo.secure_url,
    thumbnail: uploadThumbnail.secure_url,
    title: title,
    description: description,
    duration: uploadVideo.duration,
    views: 0,
    isPublished: isPublished,
    owner: req.user?.id,
  });

  const uploadedVideo = await Video.findById(video._id);
  if (!uploadedVideo) {
    throw new ApiError(500, "Something went wrong while uploading the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video uploaded sucessfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, null, "Video does not exist");
  }

  const video = await Video.findById(videoId).select(
    "-_id -__v -owner -updatedAt"
  );
  if (!video) {
    throw new ApiError(404,null, "Video does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description, isPublished } = req.body;
  const thumbnailLocalPath = req.file?.path;
  let thumbnailUpdate = null;

  let oldThumbnail = await Video.findById(videoId);
  if (thumbnailLocalPath) {
    thumbnailUpdate = await uploadOnCloudinary(thumbnailLocalPath);
    await destroyImageOnCloudinary(oldThumbnail.thumbnail);
  }

  if (!(title || description || isPublished || thumbnailLocalPath)) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (isPublished !== undefined) updateFields.isPublished = isPublished;
  if (thumbnailUpdate?.secure_url)
    updateFields.thumbnail = thumbnailUpdate.secure_url;

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields }, // Pass a single update object
    { new: true, runValidators: true } // Return updated document and validate
  );
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video Updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findByIdAndDelete(videoId);

  const thumbnailResponse = await destroyImageOnCloudinary(video.thumbnail);
  const VideoResponse = await destroyVideoOnCloudinary(video.videoFile);

  if (!(thumbnailResponse && VideoResponse)) {
    throw new ApiError(
      500,
      "Failed to delete video or thumbnail from cloud storage"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video has been successfully deleted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { isPublished } = req.body;
  if (isPublished === undefined) {
    throw new ApiError(400, "isPublished field is required");
  }
  await Video.findByIdAndUpdate(videoId, {
    isPublished: isPublished,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "Video publish status updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
