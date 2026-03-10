/**
 * ============================================================================
 * USE SIDEBAR TOGGLE HOOK
 * ============================================================================
 * Custom hook for sidebar toggle functionality with keyboard shortcut
 */

import * as React from "react";
import { SIDEBAR_KEYBOARD_SHORTCUT } from "./sidebar-constants";

interface UseSidebarToggleOptions {
  isMobile: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useSidebarToggle({
  isMobile,
  setOpen,
  setOpenMobile,
}: UseSidebarToggleOptions) {
  const toggleSidebar = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((open) => !open)
      : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Keyboard shortcut to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return { toggleSidebar };
}
