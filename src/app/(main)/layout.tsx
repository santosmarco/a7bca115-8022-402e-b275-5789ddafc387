import { redirect } from "next/navigation";

import { AppSidebar } from "~/components/app-sidebar";
import OnboardingFlow from "~/components/onboarding-flow";
import { OnboardingFlowStage2 } from "~/components/onboarding-flow-stage-2";
import { ProfileWarning } from "~/components/profile-warning";
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
      <ProfileWarning />
      <AppSidebar user={user} />
      <div className="pt-6 lg:pl-64 lg:pt-0">
        <main className="p-4 py-12 lg:p-12">
          {user && !user.did_complete_onboarding && (
            <OnboardingFlow user={user} />
          )}
          {user && !user.did_complete_post_ten_meeting_onboarding && (
            <OnboardingFlowStage2 user={user} />
          )}
          {children}
        </main>
      </div>
    </>
  );
}
