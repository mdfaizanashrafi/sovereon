/**
 * ============================================================================
 * COMMUNICATION & MESSAGING SERVICES PAGE
 * ============================================================================
 * 
 * Service category page - loads data dynamically from CMS
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { cmsApi } from '@/services/cmsApi';
import { Skeleton } from '@/components/ui/skeleton';

interface Service {
  id: string;
  slug: string;
  title: string;
  fullDescription: string;
  features: string;
  order: number;
}

interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  services: Service[];
}

export function CommunicationMessagingPage() {
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const response = await cmsApi.getServiceCategories();
        if (response.success) {
          const categories = response.data as ServiceCategory[];
          const found = categories.find(c => c.slug === 'communication-messaging');
          if (found) {
            setCategory(found);
          }
        }
      } catch (error) {
        console.error('Failed to load category:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, []);

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full max-w-xl mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Category not found</h1>
        </div>
      </div>
    );
  }

  const getFeatures = (featuresJson: string) => {
    try {
      return JSON.parse(featuresJson).slice(0, 3);
    } catch {
      return [];
    }
  };

  return (
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground">{category.title}</span>
        </div>

        {/* Header */}
        <div className="max-w-3xl mb-12">
          <Badge className="badge-ai mb-4">Service Category</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{category.title}</h1>
          <p className="text-lg text-muted-foreground">{category.description}</p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {category.services?.map((service, index) => (
            <Card
              key={service.id}
              className="ai-card group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h2>
                <p className="text-muted-foreground mb-4">{service.fullDescription}</p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Key Features:</h3>
                  <ul className="space-y-1">
                    {getFeatures(service.features).map((feature: string) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link to={`/services/${service.slug}`}>
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
