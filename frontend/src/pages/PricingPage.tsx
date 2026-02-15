/**
 * ============================================================================
 * PRICING PAGE
 * ============================================================================
 * 
 * Features:
 * - Service tier pricing (Starter, Professional, Enterprise)
 * - Feature comparison
 * - Custom quote request
 * - AI estimates mention
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { pricingPlans } from '@/data/siteData';

export function PricingPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your business needs. 
            All plans include AI-powered optimization.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`ai-card relative ${
                plan.highlighted
                  ? 'border-primary scale-105 shadow-xl shadow-primary/20'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="badge-ai">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.highlighted ? 'btn-ai' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Plan Comparison</h2>
        </div>
        
        <Card className="ai-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium">Feature</th>
                    <th className="text-center p-4 font-medium">Starter</th>
                    <th className="text-center p-4 font-medium text-primary">Professional</th>
                    <th className="text-center p-4 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'SEO Optimization', starter: 'Basic', professional: 'Advanced AI', enterprise: 'Complete Suite' },
                    { feature: 'Social Platforms', starter: '2', professional: '4', enterprise: 'Unlimited' },
                    { feature: 'Support', starter: 'Email', professional: 'Priority', enterprise: '24/7 Phone' },
                    { feature: 'Maintenance Hours', starter: '5/mo', professional: '15/mo', enterprise: 'Unlimited' },
                    { feature: 'Content Pieces', starter: '-', professional: '4/mo', enterprise: 'Unlimited' },
                    { feature: 'Reports', starter: 'Monthly', professional: 'Weekly', enterprise: 'Real-time' },
                    { feature: 'Dedicated Manager', starter: '✗', professional: '✗', enterprise: '✓' },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-border/50">
                      <td className="p-4">{row.feature}</td>
                      <td className="p-4 text-center text-muted-foreground">{row.starter}</td>
                      <td className="p-4 text-center text-primary font-medium">{row.professional}</td>
                      <td className="p-4 text-center text-muted-foreground">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Custom Quote CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="ai-card bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Every business is unique. Contact us for a tailored proposal 
              that fits your specific requirements and budget.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/contact-us" className="btn-ai px-6 py-3 rounded-lg font-medium">
                Request Custom Quote
              </a>
              <a href="tel:8789109928" className="px-6 py-3 rounded-lg font-medium border border-primary/50 hover:bg-primary/10 transition-colors">
                Call Us: 8789109928
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
