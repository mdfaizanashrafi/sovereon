/**
 * ============================================================================
 * SIDEBAR INSET
 * ============================================================================
 * Main content area when sidebar is in inset variant
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarInsetProps extends React.ComponentProps<"main"> {}

export function SidebarInset({ className, ...props }: SidebarInsetProps) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex min-h-svh flex-1 flex-col",
        "peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:mr-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
        className
      )}
      {...props}
    />
  );
}
