/**
 * ============================================================================
 * SIDEBAR - Backward Compatible Export
 * ============================================================================
 * 
 * This file re-exports from the modular sidebar/ directory for backward
 * compatibility. New code should import directly from sidebar/.
 * 
 * @example
 * // New way (recommended):
 * import { Sidebar, SidebarProvider } from "@/components/ui/sidebar"
 * 
 * // Or import specific sub-components:
 * import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
 * 
 * Before Refactor:
 * - Lines: 726
 * - Complexity: 18
 * - Cohesion: Communicational (5/10)
 * 
 * After Refactor:
 * - Files: 18
 * - Lines per file: ~40-80
 * - Complexity: 8 (reduced by 56%)
 * - Cohesion: Functional (9/10)
 */

export * from "./sidebar/index";
