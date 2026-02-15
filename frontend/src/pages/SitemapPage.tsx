/**
 * ============================================================================
 * SITEMAP PAGE
 * ============================================================================
 * 
 * Complete site navigation overview.
 * 
 * @page
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Briefcase, Users, FileText } from 'lucide-react';

const sitemapData = [
  {
    category: 'Main Pages',
    icon: Home,
    links: [
      { label: 'Home', href: '/' },
      { label: 'Who We Are', href: '/who-we-are' },
      { label: 'Why Choose Us', href: '/why-choose-us' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    category: 'Services',
    icon: Briefcase,
    links: [
      { label: 'All Services', href: '/services' },
      { label: 'Communication & Messaging', href: '/services/communication-messaging' },
      { label: 'Software & App Development', href: '/services/software-app-development' },
      { label: 'Maintenance & Support', href: '/services/maintenance-support' },
      { label: 'Cloud & IT Solutions', href: '/services/cloud-it-solutions' },
      { label: 'Digital Marketing & SEO', href: '/services/digital-marketing-seo' },
      { label: 'Content & Media Production', href: '/services/content-media-production' },
    ],
  },
  {
    category: 'Resources',
    icon: FileText,
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    category: 'Company',
    icon: Users,
    links: [
      { label: 'Careers', href: '/careers' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export function SitemapPage() {
  return (
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="badge-ai mb-4">Navigation</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Sitemap</span>
            </h1>
            <p className="text-muted-foreground">
              Find your way around our website. All pages at a glance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {sitemapData.map((section) => (
              <Card key={section.category} className="ai-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <section.icon className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">{section.category}</h2>
                  </div>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
