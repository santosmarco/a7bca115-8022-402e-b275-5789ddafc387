import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import type { SidebarProps } from "./types";

export function AppSidebar(props: SidebarProps) {
  return (
    <>
      <MobileNav {...props} />
      <DesktopNav {...props} />
    </>
  );
}
