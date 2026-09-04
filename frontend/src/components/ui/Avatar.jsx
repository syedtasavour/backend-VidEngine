import { useState } from "react";
import { accentFromId, initialsOf } from "../../utils/format.js";

const SIZES = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
};

export function Avatar({ src, name = "", id = "", size = "md", className = "" }) {
  const [failed, setFailed] = useState(false);
  const hue = accentFromId(id || name);
  const dimension = SIZES[size] ?? SIZES.md;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`${dimension} shrink-0 rounded-full border border-line object-cover ${className}`}
      />
    );
  }

  // Fall back to initials on a stable per-user hue rather than a broken image.
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: `oklch(0.55 0.14 ${hue})` }}
      className={`${dimension} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
