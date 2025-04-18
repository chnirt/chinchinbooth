"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Spotlight } from "@/components/ui/spotlight";
import LanguageSwitcher from "@/components/language-switcher";
import PolicyDialog from "./policy-dialog";

export function Navbar() {
  return (
    <div className="relative w-full border-b bg-gradient-to-r from-rose-100 to-teal-100">
      <Spotlight className="top-10 left-0 md:-top-20 md:left-60" fill="white" />

      <motion.nav
        className="relative mx-auto flex w-full max-w-6xl items-center justify-between p-4 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/">
          <h1 className="z-10 flex items-center text-2xl font-bold tracking-tight text-gray-800">
            <span className="text-pink-500">@</span>chinchinbooth
          </h1>
        </Link>

        <div className="flex items-center space-x-2">
          <PolicyDialog />
          <LanguageSwitcher />
        </div>
      </motion.nav>
    </div>
  );
}
