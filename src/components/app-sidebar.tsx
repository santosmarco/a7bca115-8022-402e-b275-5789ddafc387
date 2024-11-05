"use client";

import { AnimatePresence, motion } from "framer-motion";
import _ from "lodash";
import {
  BarChart3,
  LogOut,
  Puzzle,
  TrendingUpIcon,
  User,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import titanLogo from "~/assets/titan-logo.svg";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useProfile } from "~/hooks/use-profile";
import { createClient } from "~/lib/supabase/client";
import { type Tables } from "~/lib/supabase/database.types";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

export type AppSidebarProps = {
  user: RouterOutputs["auth"]["getUser"];
};

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const { profile: selectedProfile, setProfile: setSelectedProfile } =
    useProfile();
  const [authSectionIsHovered, setAuthSectionIsHovered] = useState(false);

  useEffect(() => {
    async function fetchProfiles() {
      if (!user.is_admin || profiles.length > 0) return;
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("*")
        .order("nickname");
      if (!allProfiles) return;
      setProfiles(allProfiles);
      if (!selectedProfile)
        setSelectedProfile(
          _.pick(user, [
            "id",
            "nickname",
            "is_admin",
          ] satisfies (keyof Tables<"profiles">)[]),
        );
    }

    void fetchProfiles();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }

    router.push("/login");
  };

  const handleProfileChange = async (profile: Tables<"profiles">) => {
    setSelectedProfile(profile);
  };

  console.log(user);

  const menuItems = [
    {
      href: "/",
      icon: <Video className="h-5 w-5" />,
      label: "Meetings",
      isActive: pathname === "/" || pathname.startsWith("/videos"),
    },
    {
      href: "/moments",
      icon: <TrendingUpIcon />,
      label: "Moments",
      isActive: pathname.startsWith("/moments"),
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
      className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-accent/25 text-foreground"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-7 py-6"
      >
        <Link href="/" className="flex items-center gap-4">
          <Image src={titanLogo} alt="Titan Logo" width={32} height={32} />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold"
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
              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group relative flex items-center gap-6 rounded-sm px-8 py-4 text-muted-foreground transition-all hover:bg-primary/10",
                    item.isActive
                      ? "text-primary before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1.5 before:rounded-r before:bg-primary"
                      : "hover:text-foreground",
                  )}
                >
                  <span>{item.icon}</span>
                  <motion.span
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-sm"
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>

      {/* Footer with Auth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto border-t border-border"
      >
        {user && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  onHoverStart={() => setAuthSectionIsHovered(true)}
                  onHoverEnd={() => setAuthSectionIsHovered(false)}
                >
                  <Button
                    variant="ghost"
                    className="group relative h-16 w-full justify-start overflow-hidden rounded-none px-4 transition-all hover:bg-none"
                  >
                    {/* Animated background gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10"
                      initial={{ x: "-100%" }}
                      animate={{ x: authSectionIsHovered ? "0%" : "-100%" }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10 flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-border/50 transition-colors group-hover:border-primary/50">
                          <AvatarImage
                            src={
                              user.user_metadata.avatar_url as
                                | string
                                | undefined
                            }
                          />
                          <AvatarFallback className="bg-primary/5">
                            {user.email?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          className="absolute -inset-1 rounded-full bg-primary/10"
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1.2, opacity: 0.5 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>

                      <div className="flex flex-col items-start text-left">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm font-medium text-foreground"
                        >
                          {selectedProfile?.nickname ??
                            user.user_metadata.full_name}
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

              <DropdownMenuContent
                align="end"
                sideOffset={-64}
                alignOffset={-256}
                className="mb-4 ml-4 w-56"
              >
                {user.is_admin && profiles.length > 0 && (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                      <User className="h-3 w-3" />
                      Admin • Switch Profile
                    </DropdownMenuLabel>
                    {profiles.map((profile) => (
                      <DropdownMenuItem
                        key={profile.id}
                        onClick={() => handleProfileChange(profile)}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            selectedProfile?.id === profile.id
                              ? "bg-primary"
                              : "bg-muted",
                          )}
                        />
                        {profile.nickname}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer gap-2 text-destructive-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </motion.div>
    </motion.aside>
  );
}
