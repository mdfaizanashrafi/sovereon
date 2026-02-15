/**
 * ============================================================================
 * CLOUD & IT SOLUTIONS SERVICE PAGE
 * ============================================================================
 * 
 * @page
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { serviceCategories } from '@/data/siteData';

export function CloudITSolutionsPage() {
  const category = serviceCategories.find(c => c.id === 'cloud-it-solutions')!;

  return (
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground">{category.title}</span>
        </div>

        <div className="max-w-3xl mb-12">
          <Badge className="badge-ai mb-4">Service Category</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{category.title}</h1>
          <p className="text-lg text-muted-foreground">{category.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {category.services.map((service, index) => (
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
                    {service.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link to={service.href}>
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
