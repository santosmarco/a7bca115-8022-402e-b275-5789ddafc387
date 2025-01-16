import type { Merge } from "type-fest";

import type { Tables } from "../supabase/database.types";

export function transformUserInviteIntoProfile(
  userInvite: Tables<"user_invites"> & {
    invited_by_profile: Tables<"profiles"> | null;
  },
): Merge<
  Tables<"profiles">,
  { id: string | null; coach: Tables<"profiles">[] }
> {
  return {
    id: null,
    nickname: [userInvite.first_name, userInvite.last_name]
      .filter(Boolean)
      .join(" "),
    email: userInvite.email,
    is_admin: false,
    role: userInvite.role ?? "user",
    coach_id: userInvite.invited_by_profile?.id ?? null,
    coach: userInvite.invited_by_profile ? [userInvite.invited_by_profile] : [],
    company: userInvite.company,
    created_at: userInvite.created_at,
    status: "pending",
    did_complete_onboarding: false,
  };
}
