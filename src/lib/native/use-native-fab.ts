import { useLayoutEffect, useRef } from "react";
import { bindFab } from "@/lib/native/chrome-store";

/** Registers the screen's floating action with the iOS shell. */
export function useNativeFab(label: string, onPress: () => void, enabled = true) {
  const pressRef = useRef(onPress);
  pressRef.current = onPress;
  useLayoutEffect(() => {
    if (!enabled) return;
    return bindFab({
      label,
      onPress: () => pressRef.current(),
    });
  }, [label, enabled]);
}
