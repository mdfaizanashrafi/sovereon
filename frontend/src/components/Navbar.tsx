/**
 * ============================================================================
 * NAVBAR COMPONENT - Sticky Navigation with CTA
 * ============================================================================
 * 
 * Features:
 * - Sticky header that remains visible on scroll
 * - Logo with company name and establishment date
 * - Navigation links to all main pages
 * - "Get Started" CTA button at top right
 * - Mobile-responsive hamburger menu
 * 
 * @component
 * @since February 2026
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Brain, User, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

// Main navigation links
const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Who We Are', href: '/who-we-are' },
  { label: 'Why Choose Us', href: '/why-choose-us' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'FAQ', href: '/faq' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  // Track scroll position for styling changes
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                Sovereon Inc.
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Est. 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Portal/CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="gap-2"
                >
                  <Link to="/portal/dashboard">
                    <User className="h-4 w-4" />
                    {user?.name?.split(' ')[0] || 'Portal'}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={logout}
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link to="/pricing">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`p-3 rounded-md transition-colors ${
                    location.pathname === link.href
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-accent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div className="mt-4 pt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Button asChild variant="outline" className="w-full mb-2">
                    <Link to="/portal/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Customer Portal
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full mb-2">
                    <Link to="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/pricing">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
