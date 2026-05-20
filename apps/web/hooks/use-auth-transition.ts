"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";

type AuthPath = "/cadastrar" | "/login";

type UseAuthTransitionReturn = {
  isTransitioning: boolean;
  navigateTo: (path: AuthPath) => void;
  overlayActive: boolean;
  onCovered: () => void;
  onDone: () => void;
};

type OverlayHandle = {
  startUncovering: () => void;
};

export function useAuthTransition(
  overlayRef: RefObject<OverlayHandle | null>
): UseAuthTransitionReturn {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const pendingPathRef = useRef<AuthPath | null>(null);
  const uncoverTimeoutRef = useRef<number | null>(null);

  const clearUncoverTimeout = useCallback(() => {
    if (uncoverTimeoutRef.current !== null) {
      window.clearTimeout(uncoverTimeoutRef.current);
      uncoverTimeoutRef.current = null;
    }
  }, []);

  const navigateTo = useCallback(
    (path: AuthPath) => {
      if (isTransitioning) {
        return;
      }

      pendingPathRef.current = path;
      setIsTransitioning(true);
      setOverlayActive(true);
    },
    [isTransitioning]
  );

  const onCovered = useCallback(() => {
    const nextPath = pendingPathRef.current;

    if (!nextPath) {
      return;
    }

    router.push(nextPath, { scroll: false });
    clearUncoverTimeout();
    uncoverTimeoutRef.current = window.setTimeout(() => {
      overlayRef.current?.startUncovering();
    }, 80);
  }, [clearUncoverTimeout, overlayRef, router]);

  const onDone = useCallback(() => {
    clearUncoverTimeout();
    pendingPathRef.current = null;
    setOverlayActive(false);
    setIsTransitioning(false);
  }, [clearUncoverTimeout]);

  useEffect(() => {
    return () => {
      clearUncoverTimeout();
    };
  }, [clearUncoverTimeout]);

  return {
    isTransitioning,
    navigateTo,
    overlayActive,
    onCovered,
    onDone
  };
}
