/**
 * ============================================================================
 * SIDEBAR CONTENT
 * ============================================================================
 * Main scrollable content area of sidebar
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarContentProps extends React.ComponentProps<"div"> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  );
}
