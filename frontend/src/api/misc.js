import { api } from "./client.js";

export const healthcheck = () => api.get("/healthcheck");
export const getWatchHistory = () => api.get("/users/history");
