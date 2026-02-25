/**
 * ============================================================================
 * SERVICES PAGE
 * ============================================================================
 * 
 * Displays service categories and services dynamically from CMS
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cmsApi } from '@/services/cmsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';

interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  order: number;
}

interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  services: Service[];
}

export function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await cmsApi.getServiceCategories();
        if (response.success) {
          setCategories((response.data as ServiceCategory[]) || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Our Services"
        description="AI systems, custom software, mobile apps, and marketing services that drive revenue. Built by engineers in Bhagalpur, Bihar."
        canonical="/services"
        keywords="AI services, custom software, mobile app development, digital marketing, Bhagalpur"
      />
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Services listing">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">What We Build</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Services That <span className="text-gradient">Drive Revenue</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Software, marketing, and AI systems built by engineers who understand business. Every project measured by impact on your bottom line.
          </p>
        </div>

        {/* Service Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id}>
              <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
              <p className="text-muted-foreground mb-6">{category.description}</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.services?.map((service) => (
                  <Link key={service.id} to={`/services/${service.slug}`}>
                    <Card className="ai-card group h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {service.shortDescription}
                        </p>
                        <div className="flex items-center text-primary text-sm font-medium">
                          See Details
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
