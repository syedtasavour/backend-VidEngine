/**
 * Inline icon set. Every glyph is drawn on a 24x24 grid with `currentColor`
 * strokes so icons inherit text colour and scale with font size.
 */
const PATHS = {
  home: "M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1H9.5v-5.5h5V21h3a1 1 0 0 0 1-1V9.5",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.6-12.6-2.1 5-5 2.1 2.1-5 5-2.1Z",
  upload: "M12 16V4m0 0L8 8m4-4 4 4M4 15v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 8a8 8 0 0 1 16 0",
  heart: "M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3c0 4.8-7.5 9.4-7.5 9.4Z",
  playlist: "M4 6h11M4 11h11M4 16h7m5 3V11l5 2.5L16 19Z",
  message: "M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.2A8 8 0 1 1 21 12Z",
  search: "m20 20-3.6-3.6M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-14v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z",
  logout: "M15 17l5-5-5-5m5 5H9m1 8H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.4-3a8.4 8.4 0 0 0-.1-1.2l2-1.5-2-3.5-2.3 1a8.5 8.5 0 0 0-2-1.2L15.6 2h-4l-.4 2.6a8.5 8.5 0 0 0-2 1.2l-2.3-1-2 3.5 2 1.5a8.5 8.5 0 0 0 0 2.4l-2 1.5 2 3.5 2.3-1a8.5 8.5 0 0 0 2 1.2l.4 2.6h4l.4-2.6a8.5 8.5 0 0 0 2-1.2l2.3 1 2-3.5-2-1.5c.06-.4.1-.8.1-1.2Z",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7m4 4v6m4-6v6",
  edit: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Zm10.5-13.5 3 3",
  play: "M8 5.5v13l11-6.5-11-6.5Z",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3.5 2",
  chart: "M4 20V10m5 10V4m5 16v-7m5 7V8",
  back: "m14 6-6 6 6 6",
  chevron: "m9 6 6 6-6 6",
  plus: "M12 5v14M5 12h14",
  check: "m5 13 4 4 10-10",
  bookmark: "M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1Z",
  film: "M4 5h16v14H4zM4 9.5h16M4 14.5h16M8.5 5v14M15.5 5v14",
  alert: "M12 8v5m0 3.5h.01M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
};

export function Icon({ name, className = "size-5", filled = false, ...props }) {
  const path = PATHS[name];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={path} />
    </svg>
  );
}
