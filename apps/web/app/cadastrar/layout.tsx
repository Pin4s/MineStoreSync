import type { ReactNode } from "react";

import { Navbar } from "../../components/navbar";

type RegisterLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0d0f18] text-white">
      <Navbar />
      {children}
    </div>
  );
}
