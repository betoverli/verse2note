import { useLayoutEffect, useRef } from "react";
import { bindFab, type FabMenuItem } from "@/lib/native/chrome-store";

export type NativeFabOptions = {
  enabled?: boolean;
  /** Attach a UIMenu to the native + button (Liquid Glass chrome). */
  menu?: FabMenuItem[];
  onMenuSelect?: (id: string) => void;
};

/** Registers the screen's floating action with the iOS shell. */
export function useNativeFab(
  label: string,
  onPress: () => void,
  enabledOrOptions: boolean | NativeFabOptions = true,
) {
  const pressRef = useRef(onPress);
  pressRef.current = onPress;
  const options: NativeFabOptions =
    typeof enabledOrOptions === "boolean" ? { enabled: enabledOrOptions } : enabledOrOptions;
  const enabled = options.enabled ?? true;
  const menu = options.menu;
  const selectRef = useRef(options.onMenuSelect);
  selectRef.current = options.onMenuSelect;
  const menuKey = JSON.stringify(menu ?? []);

  useLayoutEffect(() => {
    if (!enabled) return;
    return bindFab({
      label,
      onPress: () => pressRef.current(),
      menu,
      onMenuSelect: (id) => selectRef.current?.(id),
    });
    // menuKey stands in for menu contents so callers can pass a fresh array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, enabled, menuKey]);
}
