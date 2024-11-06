import { redirect } from "next/navigation";

import { AppSidebar } from "~/components/app-sidebar";
import { api } from "~/trpc/server";

export default async function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  let user: Awaited<ReturnType<typeof api.auth.getUser>> | null = null;
  try {
    user = await api.auth.getUser();
  } catch (error) {
    console.error("Failed to get user:", error);
    redirect("/login");
  }

  return (
    <>
      <AppSidebar user={user} />
      <div className="pl-64">
        <main className="p-12">{children}</main>
      </div>
    </>
  );
}
