/**
 * ============================================================================
 * WEB & APP MAINTENANCE SERVICE PAGE
 * ============================================================================
 * 
 * @page
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, TrendingUp, Shield } from 'lucide-react';
import { serviceCategories } from '@/data/siteData';

export function WebAppMaintenancePage() {
  const service = serviceCategories
    .find(c => c.id === 'maintenance-support')
    ?.services.find(s => s.id === 'web-app-maintenance')!;

  return (
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <ArrowRight className="w-4 h-4" />
          <Link to="/services/maintenance-support" className="hover:text-primary transition-colors">Maintenance</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground">{service.title}</span>
        </div>

        <div className="max-w-4xl mb-12">
          <Badge className="badge-ai mb-4">AI-Enhanced Service</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {service.title} <span className="text-gradient">– AI-Advanced</span>
          </h1>
          <p className="text-xl text-muted-foreground">{service.fullDescription}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="ai-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your digital assets need constant care to perform at their best. Our AI-powered 
                  monitoring system detects issues before they impact your users, while our expert 
                  team handles security updates, performance optimization, and regular maintenance 
                  to keep everything running smoothly.
                </p>
              </CardContent>
            </Card>

            <Card className="ai-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="ai-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">How We Accomplish</h2>
                <div className="space-y-4">
                  {service.strategy.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary-foreground">{step.step}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="ai-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Benefits</h3>
                <ul className="space-y-3">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="ai-card bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="p-6 text-center">
                <Shield className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Protect Your Assets</h3>
                <Button asChild className="w-full btn-ai mt-4">
                  <Link to="/pricing">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
