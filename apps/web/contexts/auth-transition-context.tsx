"use client";

import { createContext, useContext } from "react";

type AuthTransitionContextValue = {
  navigateTo: (path: "/cadastrar" | "/login") => void;
  isTransitioning: boolean;
};

export const AuthTransitionContext = createContext<AuthTransitionContextValue>({
  navigateTo: () => {},
  isTransitioning: false
});

export function useAuthTransitionContext() {
  return useContext(AuthTransitionContext);
}
