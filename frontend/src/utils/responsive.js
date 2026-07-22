import {
  useEffect,
  useState,
} from "react";

export function createAutoFitMinmax(
  minWidth
) {
  return `repeat(auto-fit, minmax(min(100%, ${minWidth}px), 1fr))`;
}

export function useCompactLayout(
  maxWidth = 900
) {
  const query = `(max-width: ${maxWidth}px)`;

  const getMatch = () =>
    typeof window !== "undefined" &&
    window.matchMedia(query).matches;

  const [isCompact, setIsCompact] =
    useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery =
      window.matchMedia(query);

    function handleChange(event) {
      setIsCompact(event.matches);
    }

    setIsCompact(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener(
        "change",
        handleChange
      );
    } else {
      mediaQuery.addListener(
        handleChange
      );
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener(
          "change",
          handleChange
        );
      } else {
        mediaQuery.removeListener(
          handleChange
        );
      }
    };
  }, [query]);

  return isCompact;
}
