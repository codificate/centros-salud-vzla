import { useEffect, useState } from "react";

/** Desktop/laptop breakpoint (Tailwind `lg`). */
export const WIDE_SCREEN_QUERY = "(min-width: 1024px)";

/** True on wide desktop/laptop screens; false on responsive devices or SSR. */
export function isWideScreen(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(WIDE_SCREEN_QUERY).matches;
}

/** Reactive `isWideScreen` that updates on viewport changes. */
export function useIsWideScreen(): boolean {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(WIDE_SCREEN_QUERY);
    const update = () => setWide(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return wide;
}
