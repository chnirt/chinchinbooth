"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import PolicyDialog from "./policy-dialog";

export function Navbar() {
  return (
    <nav className="booth-navbar sticky top-0 z-30 flex h-14 w-full items-center justify-center">
      <div className="relative flex w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/">
          <h1 className="flex items-center gap-0.5 text-base font-bold tracking-tight text-gray-950 sm:text-lg">
            <span className="booth-wordmark-at">@</span>
            <span className="booth-wordmark">chinchinbooth</span>
          </h1>
        </Link>

        <div className="booth-navbar-actions flex shrink-0 items-center gap-2">
          <PolicyDialog />
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
