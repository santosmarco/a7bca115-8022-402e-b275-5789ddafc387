"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  LogOut,
  Puzzle,
  TrendingUpIcon,
  User,
  UsersIcon,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
import type { Tables } from "~/lib/supabase/database.types";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

export type SidebarContentProps = {
  user: RouterOutputs["auth"]["getUser"];
  onNavClick?: () => void;
};

export function SidebarContent({ user, onNavClick }: SidebarContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [didSetProfiles, setDidSetProfiles] = useState(false);
  const { profile: selectedProfile, setProfile: setSelectedProfile } =
    useProfile();
  const [authSectionIsHovered, setAuthSectionIsHovered] = useState(false);

  useEffect(() => {
    if (didSetProfiles) return;

    async function fetchProfiles() {
      let query = supabase.from("profiles").select("*").order("nickname");
      if (!user.is_admin) {
        query = query.or(`id.eq.${user.id},coach_id.eq.${user.id}`);
      }
      const { data: allProfiles } = await query;
      setProfiles(allProfiles ?? []);
      setDidSetProfiles(true);
    }

    void fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }

    localStorage.removeItem("profile");
    router.push("/login");
  };

  const handleProfileChange = async (profile: Tables<"profiles">) => {
    setSelectedProfile(profile);
  };

  const menuItems = [
    {
      href: "/insights",
      icon: <Brain className="h-5 w-5" />,
      label: "Insights",
      isActive: pathname.startsWith("/insights"),
    },
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
    (selectedProfile?.role === "coach" || selectedProfile?.is_admin) && {
      href: "/clients",
      icon: <UsersIcon className="h-5 w-5" />,
      label: "Clients",
      isActive: pathname.startsWith("/clients"),
    },
  ].filter((x): x is Exclude<typeof x, false | undefined> => !!x);

  return (
    <>
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
              <Link href={item.href} onClick={onNavClick}>
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
                              !selectedProfile || selectedProfile.id === user.id
                                ? (user.user_metadata.avatar_url as
                                    | string
                                    | undefined)
                                : undefined
                            }
                          />
                          <AvatarFallback className="bg-primary/5">
                            {(selectedProfile?.email ?? user.email)
                              ?.slice(0, 2)
                              .toUpperCase()}
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
                          {selectedProfile?.email ?? user.email}
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
                {profiles.length > 1 && (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                      <User className="h-3 w-3" />
                      {user.is_admin ? "Admin" : "Coach"} • Switch Profile
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
                        <span className="flex items-baseline gap-x-2">
                          {profile.nickname}
                          {profile.id === user.id && (
                            <span className="text-xs text-muted-foreground">
                              (You)
                            </span>
                          )}
                        </span>
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
    </>
  );
}
