"use client";

import { AnimatePresence,motion } from "framer-motion";
import { BarChart3, LogOut, Puzzle, TrendingUpIcon, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { createClient } from "~/lib/supabase/client";
import { cn } from "~/lib/utils";

type SidebarButtonProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  className?: string;
};

function SidebarButton({
  href,
  icon,
  label,
  isActive,
  className,
}: SidebarButtonProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative flex items-center gap-6 rounded-sm px-8 py-4 text-muted-foreground transition-all hover:bg-blue-500/10",
          isActive
            ? "text-blue-500 before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1.5 before:rounded-r before:bg-blue-500"
            : "hover:text-primary-foreground",
          className,
        )}
      >
        <motion.div
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <motion.span
          initial={{ x: -5, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-sm"
        >
          {label}
        </motion.span>
      </motion.div>
    </Link>
  );
}

export function AppSidebar({
  user,
}: {
  user: Awaited<
    ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>
  >["data"]["user"];
}) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    {
      href: "/moments",
      icon: <TrendingUpIcon />,
      label: "Moments",
      isActive: pathname.startsWith("/moments"),
    },
    {
      href: "/",
      icon: <Video className="h-5 w-5" />,
      label: "Meetings",
      isActive: pathname === "/" || pathname.startsWith("/videos"),
    },
    {
      href: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Reports",
      isActive: pathname.startsWith("/reports"),
    },
    {
      href: "/integrations",
      icon: <Puzzle className="h-5 w-5" />,
      label: "Integrations",
      isActive: pathname.startsWith("/integrations"),
    },
  ];

  return (
    <motion.aside
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-black text-white"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 py-6"
      >
        <Link href="/" className="flex items-center gap-2">
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <path
              d="M4 9h16M4 9v7M4 9H2m18 0v7m0-7h2M4 16h16m-13 4V16m10 4V16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium"
          >
            Titan
          </motion.span>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="mt-32 flex-1 space-y-2">
        <AnimatePresence>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SidebarButton
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>

      {/* Footer with Auth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto border-t border-border/10 px-2 py-4"
      >
        {user && (
          <div className="mt-4 px-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start px-2 py-3 hover:bg-blue-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              user.user_metadata.avatar_url as
                                | string
                                | undefined
                            }
                          />
                          <AvatarFallback>
                            {user.email?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div className="flex flex-col items-start text-left">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm font-medium text-foreground"
                        >
                          {user.user_metadata.full_name}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="text-xs text-muted-foreground"
                        >
                          {user.email}
                        </motion.span>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </motion.div>
    </motion.aside>
  );
}
