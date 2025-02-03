import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const isOwner = asyncHandler(async(req , _ ,next)=>{
    //   try {
    //     await Video.findById(videoId);
    //   } catch (error) {
    //     throw new ApiError(404, "Video does not exist");
    //   }
    //   const { owner } = await Video.findById(videoId);

    //   if (req.user._id.toString() !== owner.toString()) {
    //     throw new ApiError(500, "Unauthorized access");
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
})

export {isOwner}