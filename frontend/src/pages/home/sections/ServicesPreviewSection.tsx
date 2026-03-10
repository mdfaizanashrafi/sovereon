/**
 * ============================================================================
 * SERVICES PREVIEW SECTION
 * ============================================================================
 * Service categories grid with CMS integration
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { cmsApi } from '@/services/cmsApi';
import type { ServiceCategory } from '../types';

export function ServicesPreviewSection() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await cmsApi.getServiceCategories();
        if (response.success) {
          setCategories((response.data as ServiceCategory[])?.slice(0, 6) || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <section className="section-padding bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Our Services</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            Services That <span className="text-gradient">Move the Needle</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From custom software to marketing campaigns, everything we deliver is measured against revenue impact.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link key={category.id} to={`/services/${category.slug}`}>
                <Card
                  className="ai-card group h-full animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      See What We Build
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button asChild className="btn-ai">
            <Link to="/services">
              View All Services
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ServicesPreviewSection;
