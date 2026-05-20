import type { ReactNode } from "react";

import { Navbar } from "../../components/navbar";
import { jetBrainsMono, shareTechMono } from "@/lib/fonts";

type RegisterLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <div
      className={`${jetBrainsMono.variable} ${shareTechMono.variable} min-h-screen bg-[#050505] font-[family:var(--font-jetbrains-mono)] text-white`}
    >
      <Navbar />
      {children}
    </div>
  );
}
