import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

const {channelId} = req.params
const stats = await Video.aggregate([
    {
        $match: {
            owner: new mongoose.Types.ObjectId(channelId) // Match videos by owner (channel)
        }
    },
    {
        $lookup: {
            from: "likes", // Lookup likes for each video
            localField: "_id",
            foreignField: "video",
            as: "likes"
        }
    },
    {
        $addFields: {
            likeCount: { $size: "$likes" } // Count likes per video
        }
    },
    {
        $group: {
            _id: "$owner", // Group by channel ID (owner)
            totalVideos: { $sum: 1 }, // Count total videos
            totalLikes: { $sum: "$likeCount" }, // Sum all likes
            // videos: {
            //     $push: {
            //         _id: "$_id",
            //         videoFile: "$videoFile",
            //         thumbnail: "$thumbnail", // FIXED
            //         title: "$title", // ADDED MISSING TITLE
            //         description: "$description",
            //         likeCount: "$likeCount"
            //     }
            // } 
        }
    },
   
]);
const subscribers = await Subscription.countDocuments({ channel: channelId })
if (stats.length > 0) {
    stats[0].subscribers = subscribers;
}else{
    throw new ApiError(500, null, "Failed to retrieve channel statistics. Please try again later.")
}
return res.status(202).json(new ApiResponse(202, stats[0], "Channel statistics retrieved successfully"))
})


const getChannelVideos = asyncHandler(async (req, res) => {
    // const {channelId , page = 1 , limit =3 } = req.params
    const {channelId , page = 1 , limit =3 } = req.query
    const videos =  Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId) // Match videos by owner (channel)
            }
        },
       
    ]);
    const options = {
        page : page,
        limit : limit
    }

    const getAllVideos = await Video.aggregatePaginate(videos,options)
    return res.status(202).json(new ApiResponse(202, getAllVideos,"videos retrieved successfully"))

 
})

export {
    getChannelStats, 
    getChannelVideos
    }