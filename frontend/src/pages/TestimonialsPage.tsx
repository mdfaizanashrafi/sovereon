/**
 * ============================================================================
 * TESTIMONIALS PAGE
 * ============================================================================
 * 
 * Features:
 * - Client reviews with star ratings
 * - Before/after results
 * - Company information
 * - Filter by service category
 * 
 * PLACEHOLDERS:
 * - [PLACEHOLDER_TESTIMONIAL_AVATAR_*]: Client avatar images
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Quote } from 'lucide-react';
import { testimonials } from '@/data/siteData';

export function TestimonialsPage() {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Client Stories</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            What Our <span className="text-gradient">Clients Say</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Real feedback from real businesses we've helped grow. 
            See the results we've achieved together.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gradient">50+</div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gradient">95%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gradient">4.9</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gradient">30%</div>
              <div className="text-sm text-muted-foreground">Avg. Growth</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="ai-card animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                <p className="text-muted-foreground mb-6">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
                
                {testimonial.beforeMetric && testimonial.afterMetric && (
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Result:</span>
                      <span className="text-muted-foreground line-through">
                        {testimonial.beforeMetric}
                      </span>
                      <span className="text-primary font-medium">
                        {testimonial.afterMetric}
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
  );
}
