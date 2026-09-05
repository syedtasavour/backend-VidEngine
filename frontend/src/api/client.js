/**
 * Thin fetch wrapper for the VidEngine API.
 *
 * Two backend quirks shape this file:
 *  - Controllers answer with non-2xx codes on success (302 for comments and
 *    playlists, 202 for likes and dashboard stats), so `response.ok` alone is
 *    not a reliable verdict. The ApiResponse envelope carries a `success` flag,
 *    and that is what we trust when it is present.
 *  - Cookies are set with `secure: true`, which the browser drops on plain
 *    http://localhost. We therefore also keep the access token in storage and
 *    send it as a bearer header, which `verifyJWT` accepts.
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api/v1"
).replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "videngine.accessToken";
const REFRESH_TOKEN_KEY = "videngine.refreshToken";

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/* ------------------------------- token store ------------------------------ */

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const tokenStore = {
  get access() {
    return safeStorage()?.getItem(ACCESS_TOKEN_KEY) || null;
  },
  get refresh() {
    return safeStorage()?.getItem(REFRESH_TOKEN_KEY) || null;
  },
  set({ accessToken, refreshToken }) {
    const store = safeStorage();
    if (!store) return;
    if (accessToken) store.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) store.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear() {
    const store = safeStorage();
    if (!store) return;
    store.removeItem(ACCESS_TOKEN_KEY);
    store.removeItem(REFRESH_TOKEN_KEY);
  },
};

/* --------------------------------- helpers -------------------------------- */

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function isSuccessful(response, body) {
  if (body && typeof body.success === "boolean") return body.success;
  return response.ok;
}

function messageFor(body, response) {
  if (body?.message) return body.message;
  if (response.status === 401) return "Your session has expired. Please sign in again.";
  if (response.status === 404) return "We could not find what you were looking for.";
  if (response.status >= 500) return "The server ran into a problem. Please try again.";
  return `Request failed with status ${response.status}`;
}

/* ------------------------------ token refresh ----------------------------- */

let refreshInFlight = null;

async function refreshAccessToken() {
  // Collapse parallel 401s onto a single refresh call.
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = tokenStore.refresh;
    const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });
    const body = await parseBody(response);

    // The backend wraps this response in an error envelope even when it works,
    // so the presence of a fresh access token is the real signal.
    const accessToken = body?.data?.accessToken;
    if (!accessToken) {
      throw new ApiError("Session expired", { status: 401, data: body });
    }
    tokenStore.set({ accessToken, refreshToken: body?.data?.refreshToken });
    return accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

/* ------------------------------- the request ------------------------------ */

/** Called by AuthProvider so a dead session can bounce the user to /login. */
let onAuthFailure = () => {};
export function setAuthFailureHandler(handler) {
  onAuthFailure = typeof handler === "function" ? handler : () => {};
}

export async function request(
  path,
  { method = "GET", body, query, signal, retryOnUnauthorized = true } = {}
) {
  const isFormData = body instanceof FormData;
  const headers = {};

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const accessToken = tokenStore.access;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      headers,
      credentials: "include",
      signal,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(
      "Cannot reach the server. Check your connection and try again.",
      { status: 0 }
    );
  }

  const payload = await parseBody(response);

  if (isSuccessful(response, payload)) {
    return payload?.data !== undefined ? payload.data : payload;
  }

  const unauthorized = response.status === 401;
  const refreshEndpoint = path.startsWith("/users/refresh-token");

  if (unauthorized && retryOnUnauthorized && !refreshEndpoint) {
    try {
      await refreshAccessToken();
      return await request(path, {
        method,
        body,
        query,
        signal,
        retryOnUnauthorized: false,
      });
    } catch {
      tokenStore.clear();
      onAuthFailure();
    }
  }

  throw new ApiError(messageFor(payload, response), {
    status: response.status,
    data: payload?.data ?? null,
  });
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
