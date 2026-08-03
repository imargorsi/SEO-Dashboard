"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SHEET_TRANSITION_MS } from "@/lib/frontend/layout/sheet.constants";

/**
 * Controlled detail sheet open state that keeps the selected entity mounted
 * through the exit slide animation.
 */
export function useDetailSheetState<T>() {
  const [selected, setSelected] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const open = useCallback((item: T) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSelected(item);
    setIsOpen(true);
  }, []);

  const onOpenChange = useCallback((nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (nextOpen) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setSelected(null);
      closeTimeoutRef.current = null;
    }, SHEET_TRANSITION_MS);
  }, []);

  const clear = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(false);
    setSelected(null);
  }, []);

  return {
    selected,
    setSelected,
    isOpen,
    open,
    onOpenChange,
    clear,
  };
}
