import type { Metadata } from "next";

import { jetBrainsMono, shareTechMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MineStoreSync",
    template: "%s | MineStoreSync"
  },
  description: "Painel operacional do MineStoreSync"
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={`${jetBrainsMono.variable} ${shareTechMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#050505] font-[family:var(--font-jetbrains-mono)] text-[#f0f0f0] antialiased">
        {children}
      </body>
    </html>
  );
}
