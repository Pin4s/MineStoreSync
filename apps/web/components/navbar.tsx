"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const hideAuthButtons = pathname === "/cadastrar";

  return (
    <header className="border-b border-[#163a16] bg-black shadow-[0_1px_0_rgba(34,197,94,0.18)]">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 font-[family:var(--font-jetbrains-mono)] text-[#c7f9d3]"
        >
          <div className="grid h-10 w-10 grid-cols-2 gap-[2px] border-2 border-[#2f6d2f] bg-[#071107] p-[3px] shadow-[0_0_14px_rgba(34,197,94,0.2)]">
            <span className="bg-[#163a16]" />
            <span className="bg-[#2c7a2c]" />
            <span className="bg-[#4ade80]" />
            <span className="bg-[#14532d]" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-[family:var(--font-share-tech-mono)] text-lg uppercase tracking-[0.24em] text-[#4ade80]">
              MineStoreSync
            </span>
            <span className="text-[10px] uppercase tracking-[0.34em] text-[#5a7c63]">
              registry node
            </span>
          </div>
        </Link>
        {!hideAuthButtons ? (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              className="h-10 rounded-none border-2 border-[#2f6d2f] bg-[#081208] px-5 font-[family:var(--font-jetbrains-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[#c7f9d3] transition-[background-color,color,border-color] duration-75 hover:border-[#4ade80] hover:bg-[#123412] hover:text-[#f0fdf4]"
            >
              Login
            </Button>
            <Button
              type="button"
              className="h-10 rounded-none border-2 border-[#4ade80] bg-[#22c55e] px-5 font-[family:var(--font-jetbrains-mono)] text-xs font-bold uppercase tracking-[0.24em] text-[#031404] transition-[background-color,color,box-shadow] duration-75 hover:bg-[#4ade80] hover:shadow-[0_0_12px_rgba(74,222,128,0.35)]"
            >
              Cadastrar
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
