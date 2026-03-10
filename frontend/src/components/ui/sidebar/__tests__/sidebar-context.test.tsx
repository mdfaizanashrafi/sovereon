/**
 * ============================================================================
 * SIDEBAR CONTEXT TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSidebar, SidebarContext } from '../sidebar-context';
import * as React from 'react';

describe('useSidebar', () => {
  it('throws error when used outside provider', () => {
    expect(() => renderHook(() => useSidebar())).toThrow(
      'useSidebar must be used within a SidebarProvider'
    );
  });

  it('returns context when inside provider', () => {
    const mockContext = {
      state: 'expanded' as const,
      open: true,
      setOpen: () => {},
      openMobile: false,
      setOpenMobile: () => {},
      isMobile: false,
      toggleSidebar: () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SidebarContext.Provider value={mockContext}>
        {children}
      </SidebarContext.Provider>
    );

    const { result } = renderHook(() => useSidebar(), { wrapper });
    expect(result.current.state).toBe('expanded');
    expect(result.current.open).toBe(true);
  });
});
