import {
  useSyncExternalStore,
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

  function subscribe(callback) {
    if (typeof window === "undefined") {
      return () => {};
    }

    const mediaQuery =
      window.matchMedia(query);

    function handleChange() {
      callback();
    }

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
  }

  function getSnapshot() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia(query).matches
    );
  }

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false
  );
}
