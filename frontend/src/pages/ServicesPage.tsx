/**
 * ============================================================================
 * SERVICES PAGE - Main Services Listing
 * ============================================================================
 * 
 * This page displays all service categories with:
 * - Overview of all 6 service categories
 * - Links to individual service subpages
 * - Strategy preview for each category
 * - Call-to-action for each service
 * 
 * @page
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Code,
  Wrench,
  Cloud,
  TrendingUp,
  Camera,
  ArrowRight,
  CheckCircle,
  Brain,
} from 'lucide-react';
import { serviceCategories } from '@/data/siteData';

// Icon mapping for service categories
const categoryIcons: Record<string, React.ElementType> = {
  'communication-messaging': MessageSquare,
  'software-app-development': Code,
  'maintenance-support': Wrench,
  'cloud-it-solutions': Cloud,
  'digital-marketing-seo': TrendingUp,
  'content-media-production': Camera,
};

export function ServicesPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Header Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">What We Offer</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Our <span className="text-gradient">Services</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive digital solutions powered by advanced AI technology.
            From communication to content creation, we've got you covered.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {serviceCategories.map((category, index) => {
            const Icon = categoryIcons[category.id] || Brain;
            return (
              <Card
                key={category.id}
                className="ai-card group overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  {/* Category Header */}
                  <div className="p-6 border-b border-border/50">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {category.title}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="p-6">
                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                      {category.services.map((service) => (
                        <Link
                          key={service.id}
                          to={service.href}
                          className="flex items-start gap-2 p-3 rounded-lg hover:bg-accent transition-colors group/item"
                        >
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium group-hover/item:text-primary transition-colors">
                              {service.title}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {service.shortDescription}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button asChild variant="outline" className="w-full">
                      <Link to={category.href}>
                        Explore {category.title}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <Card className="ai-card bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-8 md:p-12 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Not Sure What You Need?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Let our AI analyze your business and recommend the perfect solution.
              Get a free consultation with our experts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="btn-ai">
                <Link to="/pricing">Get Started</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact-us">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
