"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import titanLogo from "~/assets/titan-logo.svg";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

import { SidebarContent } from "./sidebar-content";
import type { SidebarNavProps } from "./types";

export function MobileNav({ user, className }: SidebarNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden",
          className,
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src={titanLogo} alt="Titan Logo" width={32} height={32} />
          <span className="text-xl font-bold">Titan</span>
        </Link>

        <Button
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-transparent hover:text-primary lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="!h-6 !w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </motion.div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex h-screen w-64 flex-col p-0">
          <Link
            href="/"
            className="absolute left-4 top-4 flex items-center gap-2"
          >
            <Image src={titanLogo} alt="Titan Logo" width={32} height={32} />
            <span className="text-xl font-bold">Titan</span>
          </Link>

          <SidebarContent user={user} onNavClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
