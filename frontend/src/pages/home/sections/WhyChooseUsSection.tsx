/**
 * ============================================================================
 * WHY CHOOSE US SECTION
 * ============================================================================
 * Company advantages and value propositions
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Users, Zap, TrendingUp, Brain } from 'lucide-react';
import type { ReasonItem } from '../types';

const reasons: ReasonItem[] = [
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock assistance with AI monitoring to catch and resolve issues before they impact your business.',
  },
  {
    icon: Target,
    title: 'ROI-Focused Approach',
    description: 'Every strategy is designed with your bottom line in mind. We measure success by your growth, not vanity metrics.',
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Led by Md Faizan (Technical) and Altamash Khan (CRM), our team brings fresh innovation since February 2026.',
  },
  {
    icon: Zap,
    title: 'AI as Infrastructure',
    description: 'We use AI to automate repetitive work, analyze data faster, and deliver more value per rupee you spend.',
  },
  {
    icon: TrendingUp,
    title: 'Proven Results',
    description: 'Our clients see an average of 30% faster growth compared to traditional digital marketing approaches.',
  },
  {
    icon: Brain,
    title: 'Local Expertise',
    description: 'Based in Bhagalpur, Bihar, we understand the local market while delivering world-class solutions.',
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Our Advantages</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            Technical Founders, <span className="text-gradient">Business Results</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are engineers who understand P&L. That changes everything about how we build.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <Card
              key={reason.title}
              className="ai-card group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <reason.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>
                <p className="text-sm text-muted-foreground">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
