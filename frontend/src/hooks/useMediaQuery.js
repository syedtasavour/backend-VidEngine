import { useEffect, useState } from "react";

/** Mirrors a CSS media query into React, for behaviour CSS alone cannot do. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Tailwind's `md` breakpoint, in JS. */
export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
