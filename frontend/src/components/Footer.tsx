/**
 * ============================================================================
 * FOOTER COMPONENT - Site Footer with Social Links
 * ============================================================================
 * 
 * Features:
 * - Company information and description
 * - Quick navigation links organized by category
 * - Social media links (Instagram, LinkedIn, Facebook)
 * - Contact information (phone, address)
 * - Copyright and legal links
 * - Scroll-to-top on navigation
 * 
 * @component
 * @since February 2026
 * @version 2.0.0
 */

import { Link, useNavigate } from 'react-router-dom';
import { Brain, Instagram, Linkedin, Facebook, Phone, MapPin, Mail, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Footer navigation sections
const footerLinks = {
  services: [
    { label: 'Communication & Messaging', href: '/services/communication-messaging' },
    { label: 'Software Development', href: '/services/software-app-development' },
    { label: 'Cloud & IT Solutions', href: '/services/cloud-it-solutions' },
    { label: 'Digital Marketing', href: '/services/digital-marketing-seo' },
    { label: 'Content Production', href: '/services/content-media-production' },
  ],
  company: [
    { label: 'Who We Are', href: '/who-we-are' },
    { label: 'Why Choose Us', href: '/why-choose-us' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Careers', href: '/careers' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sitemap', href: '/sitemap' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

// Social media links - UPDATE THESE PLACEHOLDERS
const socialLinks = [
  {
    icon: Instagram,
    href: '[PLACEHOLDER_SOCIAL_INSTAGRAM]',
    label: 'Instagram',
    username: '@sovereoninc',
  },
  {
    icon: Linkedin,
    href: '[PLACEHOLDER_SOCIAL_LINKEDIN]',
    label: 'LinkedIn',
    username: 'Sovereon Inc.',
  },
  {
    icon: Facebook,
    href: '[PLACEHOLDER_SOCIAL_FACEBOOK]',
    label: 'Facebook',
    username: 'Sovereon Inc.',
  },
];

/**
 * Footer Link Component with scroll-to-top
 */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
    // Scroll to top after navigation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Link
      to={href}
      onClick={handleClick}
      className="text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}

/**
 * Scroll to top handler
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
}

export function Footer() {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    scrollToTop();
  };

  return (
    <footer className="bg-gradient-to-b from-background to-muted/30 border-t border-border">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Company Info Column */}
          <div className="lg:col-span-2">
            <Link 
              to="/" 
              onClick={handleLogoClick}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight">
                  Sovereon Inc.
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Est. 2026
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              AI-powered digital solutions for businesses in Bhagalpur, Bihar.
              Transforming companies with cutting-edge technology since 2026.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a 
                  href="tel:8789109928" 
                  className="hover:text-primary transition-colors"
                >
                  8789109928
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">
                  Habibpur, Bhagalpur,<br />
                  Bihar - 812002, India
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <a 
                  href="mailto:contact@sovereoninc.com" 
                  className="hover:text-primary transition-colors"
                >
                  contact@sovereoninc.com
                </a>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Services
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Connect With Us
            </h3>
            <div className="space-y-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col">
                    <span>{social.label}</span>
                    <span className="text-xs opacity-70">{social.username}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} Sovereon Inc. All rights reserved.
              <span className="hidden sm:inline"> | </span>
              <span className="block sm:inline">
                Website:{' '}
                <a 
                  href="https://[PLACEHOLDER_WEBSITE_URL]"
                  className="hover:text-primary transition-colors"
                >
                  [PLACEHOLDER_WEBSITE_URL]
                </a>
              </span>
            </p>

            {/* Legal Links + Back to Top */}
            <div className="flex items-center gap-4">
              {footerLinks.legal.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollToTop}
                className="ml-2"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
