import type { RouterOutputs } from "~/trpc/react";

export type SidebarNavProps = {
  user: RouterOutputs["auth"]["getUser"];
  className?: string;
};
