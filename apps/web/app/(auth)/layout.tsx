"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

import {
  CheckerboardOverlay,
  type CheckerboardOverlayHandle
} from "@/components/checkerboard-overlay";
import { MeshBackground } from "@/components/mesh-background";
import { AuthTransitionContext } from "@/contexts/auth-transition-context";
import { useAuthTransition } from "@/hooks/use-auth-transition";
import { Navbar } from "../../components/navbar";
import { jetBrainsMono, shareTechMono } from "@/lib/fonts";

type AuthLayoutProps = Readonly<{ children: ReactNode }>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  const overlayRef = useRef<CheckerboardOverlayHandle | null>(null);

  const { isTransitioning, navigateTo, overlayActive, onCovered, onDone } =
    useAuthTransition(overlayRef);

  return (
    <AuthTransitionContext.Provider value={{ navigateTo, isTransitioning }}>
      <div
        className={`${jetBrainsMono.variable} ${shareTechMono.variable} relative min-h-screen bg-[#050505] font-[family:var(--font-jetbrains-mono)] text-white`}
      >
        <div className="absolute inset-0 z-0">
          <MeshBackground />
        </div>

        <div className="relative z-10">
          <Navbar />
          {children}
        </div>

        <CheckerboardOverlay
          ref={overlayRef}
          active={overlayActive}
          onCovered={onCovered}
          onDone={onDone}
        />
      </div>
    </AuthTransitionContext.Provider>
  );
}
