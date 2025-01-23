"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import titanLogo from "~/assets/titan-logo.svg";
import { cn } from "~/lib/utils";

import { Badge } from "../ui/badge";
import { SidebarContent } from "./sidebar-content";
import type { SidebarNavProps } from "./types";

export function DesktopNav({ user, className }: SidebarNavProps) {
  return (
    <motion.aside
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className={cn(
        "fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-border bg-accent/25 text-foreground lg:flex",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-7 py-6"
      >
        <Link href="/" className="flex items-center gap-4">
          <Image src={titanLogo} alt="Titan Logo" width={32} height={32} />
          <div className="relative flex items-start">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold"
            >
              Titan
            </motion.span>
            <Badge
              variant="secondary"
              className="ml-1.5 rounded-sm border-border px-1 py-0.5 text-[8px] font-medium uppercase tracking-wider text-primary transition-all"
            >
              Beta
            </Badge>
          </div>
        </Link>
      </motion.div>

      <SidebarContent user={user} />
    </motion.aside>
  );
}
