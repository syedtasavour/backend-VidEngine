import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler (async (req, res) => {
  const { name, description } = req.params;
  //   console.log(name);
  // Get data from request body

  //   Create a new playlist
  let playList = null;
  try {
    playList = await Playlist.create({
      name,
      description,
      owner: req.user._id,
    });
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          null,
          error?._message ||
            "An unexpected error occurred while saving the playlist."
        )
      );
  }

  playList = await Playlist.findById(playList._id).select(
    "name description owner videos createdAt"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, playList, "Playlist created successfully."));
});
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page, limit } = req.query;
  const pageNumber = Number(page);

  const playlistAggregate = Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    // {
    //   $skip: (pageNumber - 1) * 10,
    // },
    // {
    //   $limit: 10,
    // },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        name: 1,
        videos: 1,
        description: 1,
        owner: 1,
      },
    },
  ],);
  const options = {
    page: pageNumber,   // Current page
    limit: 10, // Number of items per page
  };
  const playlist = await Playlist.aggregatePaginate(playlistAggregate,options)

  return res
    .status(302)
    .json(
      new ApiResponse(302, playlist, "User playlists fetched successfully.")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const playList = await Playlist.findById(playlistId).select(
    "-createdAt -updatedAt -__v"
  );
  if (!playList) {
    return res
      .status(404)
      .json(
        new ApiError(404, null, `Playlist with id "${playlistId}" not found.`)
      );
  }

  return res
    .status(302)
    .json(new ApiResponse(302, playList, "Playlist fetched successfully."));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    await Video.findById(videoId);
  } catch (error) {
    throw new ApiError(404, null, "Video does not exist");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    {
      new: true,
    }
  ).select("name description videos owner createdAt ")
 if(!playlist){
  throw new ApiError(500, null, "Failed to add video to playlist.");
 }
return res
  .status(200)
  .json(new ApiResponse(200, playlist, "Video successfully added to the playlist."));

});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

  const { playlistId, videoId } = req.params;

  let playlist = await Playlist.find({
    videos: videoId
  })
  if(!playlist || playlist.length === 0){
    return res.status(404).json(new ApiError(404, null, "Video not found in playlist, please try again."))
  }
  playlist = await Playlist.findByIdAndUpdate(
    playlistId, 
    { $pull: { videos: videoId } }, 
    { new: true } 
).select("videos")
  return res.status(202).json(new ApiResponse(202, playlist, "Video removed from playlist."));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  console.log(playlistId);
  

  const playList = await Playlist.findByIdAndDelete(playlistId)
  return res
    .status(200)
    .json(new ApiResponse(200, playList, "Playlist has been successfully deleted."));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
 if (!(name || description)) {
     return res.status(404).json(new ApiError(400, "At least one field is required to update")) 
   }
 
   const updateFields = {};
   if (name) updateFields.name = name;
   if (description) updateFields.description = description;

 
   const playlist = await Playlist.findByIdAndUpdate(
     playlistId,
     { $set: updateFields },
     { new: true} 
   ).select("name description createdAt videos -_id");
  return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully."));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
