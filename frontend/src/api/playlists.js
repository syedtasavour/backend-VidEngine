import { api } from "./client.js";

// Name and description travel in the path on this endpoint, so both need
// encoding to survive spaces and punctuation.
export const createPlaylist = (name, description) =>
  api.post(
    `/playlist/${encodeURIComponent(name)}/${encodeURIComponent(description)}`
  );

export const getUserPlaylists = (userId, { page = 1 } = {}) =>
  api.get(`/playlist/user/${userId}`, { query: { page } });

export const getPlaylistById = (playlistId) => api.get(`/playlist/${playlistId}`);

export const updatePlaylist = (playlistId, { name, description }) =>
  api.patch(`/playlist/${playlistId}`, { name, description });

export const deletePlaylist = (playlistId) => api.delete(`/playlist/${playlistId}`);

export const addVideoToPlaylist = (playlistId, videoId) =>
  api.patch(`/playlist/add/${videoId}/${playlistId}`);

export const removeVideoFromPlaylist = (playlistId, videoId) =>
  api.patch(`/playlist/remove/${videoId}/${playlistId}`);
