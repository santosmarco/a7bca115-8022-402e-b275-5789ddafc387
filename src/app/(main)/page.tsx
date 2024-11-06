"use client";

import { motion } from "framer-motion";
import { CameraIcon, FileVideo, Search, VideoOffIcon } from "lucide-react";

import { Input } from "~/components/ui/input";
import { useProfile } from "~/hooks/use-profile";
import { api } from "~/trpc/react";

import { VideoGrid } from "./_components/video-grid";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function HomePage() {
  const { data, isLoading } = api.videos.listAll.useQuery();
  const { profile } = useProfile();
  const { data: user, isLoading: userIsLoading } = api.auth.getUser.useQuery();
  const videos =
    user?.is_admin && (!profile || user.id === profile.id)
      ? data
      : data?.filter((v) =>
          v.tags.includes(profile?.nickname ?? user?.nickname ?? ""),
        );

  if (isLoading || userIsLoading) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <FileVideo className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Loading meetings...</p>
        </motion.div>
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <VideoOffIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No meetings found</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen space-y-8 py-8"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="relative mx-auto mb-12 max-w-2xl text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute -left-4 top-0 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute -right-4 top-0 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.h1
          variants={itemVariants}
          className="relative mb-4 text-4xl font-bold tracking-tight lg:text-5xl"
        >
          Your Meetings
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="relative mb-8 text-lg text-muted-foreground"
        >
          Discover insights from your recorded meetings
        </motion.p>

        {/* Search Bar */}
        <motion.div
          variants={itemVariants}
          className="relative mx-auto max-w-md"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search meetings..."
            className="w-full rounded-full border-primary/20 pl-10 shadow-lg transition-shadow duration-300 hover:shadow-xl focus-visible:border-primary/30 focus-visible:ring-primary/20"
          />
        </motion.div>
      </motion.div>

      {/* Video Grid */}
      <motion.div variants={itemVariants}>
        <VideoGrid videos={videos} />
      </motion.div>
    </motion.div>
  );
}
