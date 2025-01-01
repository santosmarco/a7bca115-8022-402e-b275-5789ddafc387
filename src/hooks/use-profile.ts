import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";

import type { Tables } from "~/lib/supabase/database.types";

export type ProfileState = {
  profile: Tables<"profiles"> | null;
  setProfile: (profile: Tables<"profiles">) => void;
};

export const ProfileStore = createStore(
  persist<ProfileState>(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
    }),
    { name: "profile", skipHydration: true },
  ),
);

export const useProfile = () => useStore(ProfileStore);
