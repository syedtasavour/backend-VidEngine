import { api } from "./client.js";

/**
 * Published videos for a channel.
 *
 * This is the only listing that filters on `isPublished`, so it is what we use
 * when viewing somebody else's channel. Its projection omits the thumbnail,
 * which is why VideoCard falls back to a generated poster.
 */
export const getPublishedVideos = (userId, { page = 1, limit = 12, sortBy, sortType } = {}) =>
  api.get("/videos", { query: { userId, page, limit, sortBy, sortType } });

/**
 * Every video on a channel, drafts included, with the full document.
 * Used for the signed-in user's own studio view.
 */
export const getChannelVideos = (channelId, { page = 1, limit = 12 } = {}) =>
  api.get("/dashboard/videos", { query: { channelId, page, limit } });

export const getChannelStats = (channelId) => api.get(`/dashboard/stats/${channelId}`);

export const getVideoById = (videoId) => api.get(`/videos/id/${videoId}`);

export function publishVideo({ title, description, isPublished, videoFile, thumbnail }, options) {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  form.append("isPublished", String(isPublished));
  form.append("videoFile", videoFile);
  form.append("thumbnail", thumbnail);
  return api.post("/videos", form, options);
}

export function updateVideo(videoId, { title, description, isPublished, thumbnail }) {
  const form = new FormData();
  if (title !== undefined) form.append("title", title);
  if (description !== undefined) form.append("description", description);
  if (isPublished !== undefined) form.append("isPublished", String(isPublished));
  if (thumbnail) form.append("thumbnail", thumbnail);
  return api.patch(`/videos/id/${videoId}`, form);
}

export const deleteVideo = (videoId) => api.delete(`/videos/id/${videoId}`);

export const togglePublishStatus = (videoId, isPublished) =>
  api.patch(`/videos/toggle/publish/${videoId}`, { isPublished });
