/**
 * ============================================================================
 * WHY CHOOSE US PAGE
 * ============================================================================
 * 
 * Features:
 * - 24/7 support details
 * - ROI-focused approach explanation
 * - Expert team information
 * - AI-first strategy
 * - Comparison with competitors
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Users, Zap, Brain, Shield, TrendingUp, Award } from 'lucide-react';

const reasons = [
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock assistance with AI monitoring to catch and resolve issues before they impact your business. Our support team is always available to help you succeed.',
    details: ['AI-powered issue detection', 'Instant response to critical issues', 'Dedicated support channels', 'Regular check-ins'],
  },
  {
    icon: Target,
    title: 'ROI-Focused Approach',
    description: 'Every strategy is designed with your bottom line in mind. We measure success by your growth, not vanity metrics.',
    details: ['Data-driven decisions', 'Measurable KPIs', 'Regular performance reports', 'Continuous optimization'],
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Led by Md Faizan (Technical) and Altamash Khan (CRM), our team brings fresh innovation and proven expertise since February 2026.',
    details: ['Industry-certified professionals', 'Continuous learning', 'Cross-functional expertise', 'Local market knowledge'],
  },
  {
    icon: Zap,
    title: 'AI-First Strategy',
    description: 'We leverage cutting-edge AI to deliver faster, smarter, and more effective solutions than traditional agencies.',
    details: ['AI-powered analytics', 'Automated optimization', 'Predictive insights', 'Machine learning integration'],
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'Your data security is our priority. We follow industry best practices and comply with all relevant regulations.',
    details: ['End-to-end encryption', 'Regular security audits', 'Compliance certified', 'Secure infrastructure'],
  },
  {
    icon: TrendingUp,
    title: 'Proven Results',
    description: 'Our clients see an average of 30% faster growth compared to traditional digital marketing approaches.',
    details: ['Case study backed', 'Client testimonials', 'Before/after metrics', 'Industry benchmarks'],
  },
];

export function WhyChooseUsPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Our Advantages</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Why <span className="text-gradient">Choose Us</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            What sets Sovereon apart in a competitive digital landscape. 
            We're not just another agency — we're your growth partner.
          </p>
        </div>
      </section>

      {/* Reasons Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
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
                <h2 className="text-xl font-semibold mb-3">{reason.title}</h2>
                <p className="text-muted-foreground text-sm mb-4">{reason.description}</p>
                <ul className="space-y-2">
                  {reason.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Award className="w-3 h-3 text-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Comparison</Badge>
          <h2 className="text-3xl font-bold">Sovereon vs. Traditional Agencies</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">Feature</th>
                <th className="text-center p-4 font-medium text-primary">Sovereon Inc.</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Traditional Agencies</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'AI Integration', sovereign: 'Built-in from day one', traditional: 'Limited or none' },
                { feature: 'Response Time', sovereign: '< 2 hours', traditional: '24-48 hours' },
                { feature: 'Support', sovereign: '24/7 with AI monitoring', traditional: 'Business hours only' },
                { feature: 'Pricing', sovereign: 'Transparent & flexible', traditional: 'Often hidden fees' },
                { feature: 'Local Presence', sovereign: 'Bihar-based team', traditional: 'Metro cities only' },
                { feature: 'Results Tracking', sovereign: 'Real-time dashboards', traditional: 'Monthly reports' },
              ].map((row) => (
                <tr key={row.feature} className="border-b border-border/50">
                  <td className="p-4">{row.feature}</td>
                  <td className="p-4 text-center text-primary">{row.sovereign}</td>
                  <td className="p-4 text-center text-muted-foreground">{row.traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="ai-card bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-8 md:p-12 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Join the growing list of businesses that have chosen Sovereon as their 
              digital transformation partner.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/pricing" className="btn-ai px-6 py-3 rounded-lg font-medium">
                Get Started
              </a>
              <a href="/contact-us" className="px-6 py-3 rounded-lg font-medium border border-primary/50 hover:bg-primary/10 transition-colors">
                Contact Us
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
