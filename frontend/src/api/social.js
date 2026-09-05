import { api } from "./client.js";

/* --------------------------------- comments -------------------------------- */

export const getVideoComments = (videoId, { page = 1, limit = 20 } = {}) =>
  api.get(`/comment/${videoId}`, { query: { page, limit } });

export const addComment = (videoId, content) =>
  api.post(`/comment/${videoId}`, { content });

export const updateComment = (commentId, content) =>
  api.patch(`/comment/c/${commentId}`, { content });

export const deleteComment = (commentId) => api.delete(`/comment/c/${commentId}`);

/* ---------------------------------- likes ---------------------------------- */

export const toggleVideoLike = (videoId) => api.post(`/likes/toggle/v/${videoId}`);
export const toggleCommentLike = (commentId) => api.post(`/likes/toggle/c/${commentId}`);
export const toggleTweetLike = (tweetId) => api.post(`/likes/toggle/t/${tweetId}`);

// Note: the backend registers this as POST, not GET.
export const getLikedVideos = ({ page = 1, limit = 12 } = {}) =>
  api.post(`/likes/videos`, undefined, { query: { page, limit } });

/* ---------------------------------- tweets --------------------------------- */

export const createTweet = (content) => api.post("/tweets", { content });
export const getUserTweets = (userId) => api.get(`/tweets/user/${userId}`);
export const updateTweet = (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content });
export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`);

/* ------------------------------ subscriptions ------------------------------ */

export const toggleSubscription = (channelId) => api.post(`/subscription/c/${channelId}`);

/** How many subscribers the given channel has. */
export const getSubscriberCount = (channelId) => api.get(`/subscription/u/${channelId}`);

/** How many channels the given user subscribes to. */
export const getSubscribedCount = (userId) => api.get(`/subscription/c/${userId}`);
