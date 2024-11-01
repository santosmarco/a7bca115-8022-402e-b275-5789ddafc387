import { redirect } from "next/navigation";

import { AppSidebar } from "~/components/app-sidebar";
import { getUser } from "~/lib/supabase/actions/auth";

export default async function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const userResult = await getUser();
  if (!userResult?.data) {
    redirect("/login");
  }

  const user = userResult.data;

  return (
    <>
      <AppSidebar user={user} />
      <div className="pl-64">
        <main className="p-12">{children}</main>
      </div>
    </>
  );
}
