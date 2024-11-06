import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import type { SidebarNavProps } from "./types";

export function AppSidebar(props: SidebarNavProps) {
  return (
    <>
      <MobileNav {...props} />
      <DesktopNav {...props} />
    </>
  );
}
