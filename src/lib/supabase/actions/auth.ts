"server-only";

import { actionClient } from "~/lib/safe-action";

import { createClient } from "../server";

export const getUser = actionClient.action(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  if (!user) {
    throw new Error("User not found");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profileError) {
    throw profileError;
  }
  if (!profile) {
    throw new Error("Profile not found");
  }

  return { ...user, ...profile };
});
