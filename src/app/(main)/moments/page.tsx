import { api } from "~/trpc/server";

import { MomentsPageClient } from "./page.client";

export default async function MomentsPage() {
  await api.videos.listAll.prefetch({
    moments: {
      includeNonRelevant: true,
    },
  });

  return <MomentsPageClient />;
}
