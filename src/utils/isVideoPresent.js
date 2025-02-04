import { Video } from "../models/video.model.js";
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

const isVideoPresent = asyncHandler(async (req, res, next) => {
  try {
    await Video.findById(req.params.videoId)
    next()
  } catch (error) {
    console.error("Error fetching video:", error);
    return res.status(404).json(new ApiError(404, null, "Video not found. Please verify the video ID and try again."));
    
  }
});

export { isVideoPresent };
