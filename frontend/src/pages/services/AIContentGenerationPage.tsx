/**
 * ============================================================================
 * AI CONTENT GENERATION PAGE
 * ============================================================================
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, ArrowRight, PenTool, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { serviceCategories } from '@/data/siteData';

export function AIContentGenerationPage() {
  const service = serviceCategories
    .find(c => c.id === 'ai-services')
    ?.services.find(s => s.id === 'ai-content-generation');

  if (!service) return null;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="badge-ai mb-4">
            <FileText className="w-3 h-3 mr-1" />
            AI Services
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{service.title}</h1>
          <p className="text-lg text-muted-foreground">{service.fullDescription}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="ai-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                Key Features
              </h3>
              <ul className="space-y-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="ai-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Benefits
              </h3>
              <ul className="space-y-3">
                {service.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="ai-card mb-12">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              Content Creation Workflow
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.strategy.map((step) => (
                <div key={step.step} className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                    <span className="text-primary font-bold">{step.step}</span>
                  </div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/contact-us">
            <Button size="lg" className="btn-ai">
              Scale Your Content
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AIContentGenerationPage;
