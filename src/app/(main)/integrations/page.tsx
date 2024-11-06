import { redirect } from "next/navigation";

import { api } from "~/trpc/server";

import { IntegrationsPageClient } from "./page.client";

export default async function IntegrationsPage() {
  let user: Awaited<ReturnType<typeof api.auth.getUser>> | null = null;
  try {
    user = await api.auth.getUser();
  } catch (error) {
    console.error("Failed to get user:", error);
    redirect("/login");
  }

  return <IntegrationsPageClient user={user} />;
}
