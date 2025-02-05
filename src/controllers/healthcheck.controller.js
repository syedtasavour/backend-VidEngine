import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Healthcheck } from "../models/healthcheck.model.js"


const healthcheck = asyncHandler(async (req, res) => {
    
    try {
        
        const newRecord = new Healthcheck({ name: 'Test User', age: 25 });
        await newRecord.save();
        // console.log('Data added to MongoDB');
    
        
        await newRecord.deleteOne(); 
        // console.log('Data removed from MongoDB');
        
        return res.status(200).json(new ApiResponse(200, null, "Server is healthy and running normally."));
      } catch (error) {
        throw new ApiError(500, null, error.message || "An unexpected error occurred while processing the request.")
      }
})

export {
    healthcheck
    }
    