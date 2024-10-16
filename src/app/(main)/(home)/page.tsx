"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { api } from "~/trpc/react";
import { AdminSidebar } from "./_components/admin-sidebar";
import { VideoGrid } from "./_components/video-grid";

export default function HomePage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedName, setSelectedName] = useLocalStorage(
    "selectedName",
    z.string(),
  );
  const { data: allVideos, isLoading } = api.videos.listAll.useQuery();
  const videosToShow =
    selectedName &&
    allVideos?.filter((video) => video.tags?.includes(selectedName));

  useEffect(() => {
    let typedChars = "";
    const handleKeyDown = (e: KeyboardEvent) => {
      typedChars += e.key;
      if (typedChars.toLowerCase().endsWith("admin")) {
        setShowAdmin(true);
        typedChars = "";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setShowAdmin]);

  return (
    <div className="flex min-h-screen">
      {showAdmin && (
        <AdminSidebar
          selectedName={selectedName ?? ""}
          onNameSelect={(name) => setSelectedName(name)}
          onClose={() => setShowAdmin(false)}
        />
      )}
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-2xl font-bold">Videos</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : videosToShow ? (
          videosToShow.length > 0 ? (
            <VideoGrid videos={videosToShow} />
          ) : (
            <p>No videos found</p>
          )
        ) : (
          <p>Unauthorized</p>
        )}
      </main>
    </div>
  );
}
