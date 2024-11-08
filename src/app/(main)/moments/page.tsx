import { api } from "~/trpc/server";

import { MomentsPageClient } from "./page.client";

export default async function MomentsPage() {
  const data = await api.videos.listAll({
    limit: 50, // @todo: optimize
  });

  return <MomentsPageClient data={data} />;
}
