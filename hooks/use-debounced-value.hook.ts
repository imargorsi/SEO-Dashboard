"use client";

import { useEffect, useState } from "react";

export const DEFAULT_TABLE_SEARCH_DEBOUNCE_MS = 400;

export function useDebouncedValue<T>(value: T, delayMs = DEFAULT_TABLE_SEARCH_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}
