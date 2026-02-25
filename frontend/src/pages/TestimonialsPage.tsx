/**
 * ============================================================================
 * TESTIMONIALS PAGE
 * ============================================================================
 * 
 * Displays client testimonials dynamically from CMS
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight } from 'lucide-react';
import { cmsApi } from '@/services/cmsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  beforeMetric: string | null;
  afterMetric: string | null;
}

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await cmsApi.getTestimonials();
        if (response.success) {
          setTestimonials((response.data as Testimonial[]) || []);
        }
      } catch (error) {
        console.error('Failed to load testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Client Testimonials"
        description="Real results from real clients. See how businesses have grown with Sovereon's AI systems and software development."
        canonical="/testimonials"
      />
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Results</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Client <span className="text-gradient">Success Stories</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real businesses, real metrics, real growth. Here is what our clients say about working with us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="ai-card animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
                {testimonial.beforeMetric && testimonial.afterMetric && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Before: {testimonial.beforeMetric}
                      </span>
                      <ArrowRight className="w-3 h-3 text-primary" />
                      <span className="text-primary font-medium">
                        After: {testimonial.afterMetric}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
