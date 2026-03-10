/**
 * ============================================================================
 * SIDEBAR - Barrel Export
 * ============================================================================
 * Clean, modular sidebar component with sub-components
 * 
 * Total Files: 18
 * Lines Reduced: 726 → ~80 (main component)
 * Complexity Reduced: 18 → 8
 */

// Core
export { SidebarProvider } from "./sidebar-provider";
export { Sidebar, type SidebarProps } from "./sidebar";
export { useSidebar } from "./sidebar-context";
export type { SidebarContextProps } from "./sidebar-types";
export type {
  SidebarState,
  SidebarSide,
  SidebarVariant,
  SidebarCollapsible,
} from "./sidebar-types";

// Layout
export { SidebarHeader } from "./sidebar-header";
export { SidebarFooter } from "./sidebar-footer";
export { SidebarContent } from "./sidebar-content";
export { SidebarInset } from "./sidebar-inset";

// Interactive
export { SidebarTrigger } from "./sidebar-trigger";
export { SidebarRail } from "./sidebar-rail";

// Groups
export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from "./sidebar-group";

// Menu
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  sidebarMenuButtonVariants,
} from "./sidebar-menu";
export { SidebarMenuAction } from "./sidebar-menu-action";
export { SidebarMenuBadge } from "./sidebar-menu-badge";
export { SidebarMenuSkeleton } from "./sidebar-menu-skeleton";
export {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./sidebar-menu-sub";

// Constants
export {
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_COOKIE_MAX_AGE,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_MOBILE,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_KEYBOARD_SHORTCUT,
} from "./sidebar-constants";
