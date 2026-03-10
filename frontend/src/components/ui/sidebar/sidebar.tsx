/**
 * ============================================================================
 * SIDEBAR COMPONENT
 * ============================================================================
 * Main sidebar component with mobile and desktop variants
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { SidebarMobile } from "./sidebar-mobile";
import { SidebarDesktop } from "./sidebar-desktop";
import type {
  SidebarCollapsible,
  SidebarSide,
  SidebarVariant,
} from "./sidebar-types";

export interface SidebarProps extends React.ComponentProps<"div"> {
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
}

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: SidebarProps) {
  const { isMobile } = useSidebar();

  // Non-collapsible variant
  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Mobile variant
  if (isMobile) {
    return <SidebarMobile side={side}>{children}</SidebarMobile>;
  }

  // Desktop variant
  return (
    <SidebarDesktop
      side={side}
      variant={variant}
      collapsible={collapsible}
      className={className}
      {...props}
    >
      {children}
    </SidebarDesktop>
  );
}
