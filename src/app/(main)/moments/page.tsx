import { api } from "~/trpc/server";

import { MomentsPageClient } from "./page.client";

export default async function MomentsPage() {
  const videos = await api.videos.listAll();

  return <MomentsPageClient videos={videos} />;
}
