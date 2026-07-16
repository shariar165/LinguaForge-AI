"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Read a browser-only value (feature detection, window state) in a
 * hydration-safe way: the server render uses `serverValue`, the client
 * render uses `getValue()`. Value must be a primitive or stable reference.
 */
export function useClientValue<T>(getValue: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getValue, () => serverValue);
}
