import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { subscribe } from "diagnostics_channel";
import { log } from "console";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const response = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(req.user.id),
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
  ]);
  console.log(response);

  if (response.length) {
    const deletedSubscription = await Subscription.findByIdAndDelete(
      response[0]._id
    ).select("-_id -createdAt -updatedAt -__v");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          deletedSubscription,
          "You have successfully unsubscribed"
        )
      );
  }

  if (!response.length) {
    const subscribed = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    const response = await Subscription.findById(subscribed._id).select(
      "-_id -createdAt -updatedAt -__v"
    );
    if (!response) {
      throw new ApiError(500, "Something went wrong with the database");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          "You have successfully subscribed to the channel."
        )
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  
  


  // const subs = await Subscription.find({ channel: subscriberId });
  // if (!subs.length) {
  //   return res
  //     .status(404)
  //     .json(new ApiResponse(404, null, "No subscriptions found."));
  // }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $group: {
        _id: "$channel",
        subscriberCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  if (!subscribers[0]) {
    subscribers[0] = { subscriberCount: 0 };
}
  
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers[0],
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // console.log(req.params);
  
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: "$subscriber",
        subscriberCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  // console.log(channelId);
  
  if (!subscribers[0]) {
    subscribers[0] = { subscriberCount: 0 };
}
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers[0],
        "Channel subscribed channel count fetched successfully"
      )
    );

});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
