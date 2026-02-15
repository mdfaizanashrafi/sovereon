/**
 * ============================================================================
 * SCROLL TO TOP COMPONENT
 * ============================================================================
 * 
 * Automatically scrolls to the top of the page on route changes.
 * Fixes the issue where navigation keeps scroll position at footer.
 * 
 * @component
 * @since February 2026
 * @version 2.0.0
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Scrolls window to top on route change
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

/**
 * Hook to manually scroll to top
 */
export function useScrollToTop() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return scrollToTop;
}
