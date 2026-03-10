/**
 * ============================================================================
 * SIDEBAR FOOTER
 * ============================================================================
 * Footer section of sidebar
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarFooterProps extends React.ComponentProps<"div"> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}
