import { api, HydrateClient } from "~/trpc/server";

export default async function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await Promise.all([
    api.auth.getUser.prefetch(),
    api.coachingFrameworks.list.prefetch(),
    api.videos.list.prefetch({ limit: 12 }),
  ]);

  return <HydrateClient>{children}</HydrateClient>;
}
