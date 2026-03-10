/**
 * ============================================================================
 * SIDEBAR MOBILE
 * ============================================================================
 * Mobile variant of sidebar using Sheet component
 */

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useSidebar } from "./sidebar-context";
import type { SidebarSide } from "./sidebar-types";
import { SIDEBAR_WIDTH_MOBILE } from "./sidebar-constants";

interface SidebarMobileProps {
  side?: SidebarSide;
  children: React.ReactNode;
}

export function SidebarMobile({ side = "left", children }: SidebarMobileProps) {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent
        data-sidebar="sidebar"
        data-slot="sidebar"
        data-mobile="true"
        className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
        side={side}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Displays the mobile sidebar.</SheetDescription>
        </SheetHeader>
        <div className="flex h-full w-full flex-col">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
