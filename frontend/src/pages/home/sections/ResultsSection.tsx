/**
 * ============================================================================
 * RESULTS SECTION
 * ============================================================================
 * Stats and before/after comparison
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star, CheckCircle, Clock } from 'lucide-react';
import type { StatItem } from '../types';

const stats: StatItem[] = [
  { label: 'Revenue Growth', value: '30%', icon: TrendingUp, description: 'Average client improvement' },
  { label: 'Client Retention', value: '95%', icon: Star, description: 'Continue after first project' },
  { label: 'Projects Shipped', value: '50+', icon: CheckCircle, description: 'Across India and abroad' },
  { label: 'Support Response', value: '<2hr', icon: Clock, description: 'Even on weekends' },
];

export function ResultsSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="badge-ai mb-4">Expected Results</Badge>
            <h2 className="text-responsive-section font-bold mb-4">
              Measurable Growth, <span className="text-gradient">Not Vanity Metrics</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We track revenue impact, lead quality, and conversion rates. Everything else is just noise.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Card
                key={stat.label}
                className="ai-card group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-3xl lg:text-4xl font-bold text-gradient mb-1">
                    {stat.value}
                  </div>
                  <div className="font-medium mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground" aria-label={`${stat.label} description`}>
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Before/After Comparison */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="ai-card border-destructive/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="font-medium text-destructive">Before AI</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span> Stagnant lead generation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span> Manual, time-consuming processes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span> Limited data insights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span> Slow market response
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="ai-card border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-medium text-primary">With Sovereon AI</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> 40% increase in qualified leads
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Automated, efficient workflows
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Real-time AI-powered analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Instant market adaptation
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResultsSection;
