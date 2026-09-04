import { api, tokenStore } from "./client.js";

export function login({ identifier, password }) {
  // The backend accepts either username or email; pick based on the shape.
  const key = identifier.includes("@") ? "email" : "username";
  return api
    .post("/users/login", { [key]: identifier.trim().toLowerCase(), password })
    .then((data) => {
      tokenStore.set({
        accessToken: data?.accessToken,
        refreshToken: data?.refreshToken,
      });
      return data?.user ?? null;
    });
}

export function register({ fullName, email, username, password, avatar, coverImage }) {
  const form = new FormData();
  form.append("fullName", fullName);
  form.append("email", email.trim().toLowerCase());
  form.append("username", username.trim().toLowerCase());
  form.append("password", password);
  form.append("avatar", avatar);
  if (coverImage) form.append("coverImage", coverImage);
  return api.post("/users/register", form);
}

export async function logout() {
  try {
    await api.post("/users/logout");
  } finally {
    // Even if the call fails the local session must not survive.
    tokenStore.clear();
  }
}

export const getCurrentUser = () => api.get("/users/current-user");

export const changePassword = ({ oldPassword, newPassword }) =>
  api.post("/users/change-password", { oldPassword, newPassword });

export const updateAccount = ({ fullName, email }) =>
  api.patch("/users/account", { fullName, email });

export function updateAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  return api.patch("/users/avatar", form);
}

export function updateCoverImage(file) {
  const form = new FormData();
  form.append("coverImage", file);
  return api.patch("/users/coverImage", form);
}

export const getChannelProfile = (username) =>
  api.get(`/users/c/${encodeURIComponent(username.toLowerCase())}`);
