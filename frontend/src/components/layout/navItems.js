/** Shared by the mobile tab bar and the desktop sidebar so they never drift. */
export const PRIMARY_NAV = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/search", label: "Search", icon: "search" },
  { to: "/upload", label: "Upload", icon: "upload", accent: true },
  { to: "/tweets", label: "Tweets", icon: "message" },
  { to: "/library", label: "Library", icon: "bookmark" },
];

export const LIBRARY_NAV = [
  { to: "/library", label: "Liked videos", icon: "heart" },
  { to: "/playlists", label: "Playlists", icon: "playlist" },
  { to: "/history", label: "Watch history", icon: "clock" },
  { to: "/studio", label: "Your studio", icon: "chart" },
];
