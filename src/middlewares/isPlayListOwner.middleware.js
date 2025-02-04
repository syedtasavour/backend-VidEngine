import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";

const isPlaylistOwner = asyncHandler(async(req, _ , next)=>{
    
    const playListOwner = await Playlist.findById(req.params.playlistId)
    if (!playListOwner) {
        throw new ApiError(404, "Playlist does not exist");
      }
    
   
    

    if(playListOwner.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Unauthorized access");
    }
    next()
})

export {isPlaylistOwner}