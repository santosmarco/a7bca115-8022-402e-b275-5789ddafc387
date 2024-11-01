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
    user = await api.auth.getUser();
  } catch {
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
