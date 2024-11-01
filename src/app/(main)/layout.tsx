import { redirect } from "next/navigation";

import { AppSidebar } from "~/components/app-sidebar";
import { api } from "~/trpc/server";

export default async function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  let user;
  try {
    console.log("[Main Layout] Fetching user");
    user = await api.auth.getUser();
    console.log("[Main Layout] User fetched successfully", {
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error("[Main Layout] Failed to fetch user", {
      error,
      errorMessage: (error as Error).message,
      stack: (error as Error).stack,
    });
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
