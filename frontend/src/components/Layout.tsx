/**
 * ============================================================================
 * LAYOUT COMPONENT - Main Page Wrapper
 * ============================================================================
 * 
 * This component wraps all pages with the common layout elements:
 * - ThemeProvider for light/dark mode
 * - ScrollToTop for route change scrolling
 * - Navigation bar (sticky header with CTA)
 * - Footer with social links and contact info
 * - Main content area with proper spacing
 * - Page transition animations
 * 
 * @component
 * @since February 2026
 * @version 2.0.0
 */

import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ThemeProvider } from './ThemeProvider';
import { ScrollToTop } from './ScrollToTop';

export function Layout() {
  return (
    <ThemeProvider defaultTheme="light">
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16 lg:pt-20">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
