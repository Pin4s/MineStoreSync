"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const hideAuthButtons = pathname === "/cadastrar";

  return (
    <header className="border-b border-white/10 bg-[#0d0f18]">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="h-10 w-10 rounded-md border border-white/15 bg-transparent" />
          <span className="text-base font-semibold tracking-tight">nome</span>
        </Link>
        {!hideAuthButtons ? (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              className="bg-green-500 font-semibold text-white hover:bg-green-600"
            >
              Login
            </Button>
            <Button
              type="button"
              className="bg-green-500 font-semibold text-white hover:bg-green-600"
            >
              Cadastrar
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
