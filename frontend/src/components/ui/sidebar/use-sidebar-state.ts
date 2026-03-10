/**
 * ============================================================================
 * USE SIDEBAR STATE HOOK
 * ============================================================================
 * Custom hook for managing sidebar open state with cookie persistence
 */

import * as React from "react";
import { SIDEBAR_COOKIE_NAME, SIDEBAR_COOKIE_MAX_AGE } from "./sidebar-constants";
import type { SidebarState } from "./sidebar-types";

interface UseSidebarStateOptions {
  defaultOpen?: boolean;
  openProp?: boolean;
  setOpenProp?: (open: boolean) => void;
}

export function useSidebarState({
  defaultOpen = true,
  openProp,
  setOpenProp,
}: UseSidebarStateOptions) {
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // Persist state in cookie
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );

  const state: SidebarState = open ? "expanded" : "collapsed";

  return { open, setOpen, state };
}
