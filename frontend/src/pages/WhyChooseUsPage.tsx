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
import { SEO } from '@/components/SEO';

const reasons = [
  {
    icon: Target,
    title: 'Revenue First',
    description: 'Every project starts with one question: how will this impact your bottom line? We measure everything against revenue growth or cost reduction.',
    details: ['ROI tracking on all projects', 'Revenue-focused metrics', 'Cost-benefit analysis upfront', 'Performance guarantees'],
  },
  {
    icon: Users,
    title: 'Technical Founders',
    description: 'Led by engineers who have built and scaled systems. We understand both the technical architecture and the business model.',
    details: ['Founder-led technical reviews', 'Engineers who understand P&L', 'No sales jargon, just facts', 'Direct access to decision makers'],
  },
  {
    icon: Zap,
    title: 'AI as Infrastructure',
    description: 'We use AI to automate repetitive work, analyze data faster, and deliver more value per rupee you spend. Not as a buzzword, but as a tool.',
    details: ['Automated reporting', 'Predictive analytics', 'Smart automation', 'Continuous optimization'],
  },
  {
    icon: Clock,
    title: '24/7 Monitoring',
    description: 'Your systems are monitored around the clock. Issues get detected and often resolved before you even know they existed.',
    details: ['Real-time uptime monitoring', 'Automated alert systems', 'Emergency response protocol', 'Weekly health reports'],
  },
  {
    icon: Shield,
    title: 'Security Built In',
    description: 'Security is not an add-on. It is built into every system from day one. Encryption, audits, and compliance as standard.',
    details: ['End-to-end encryption', 'Regular penetration testing', 'GDPR and IT Act compliance', 'Secure by default architecture'],
  },
  {
    icon: TrendingUp,
    title: 'Proven Track Record',
    description: 'Our clients see measurable improvements. We share before/after metrics and stand behind our work with performance commitments.',
    details: ['Documented case studies', 'Client testimonials with metrics', 'Transparent reporting', 'Continuous improvement'],
  },
];

export function WhyChooseUsPage() {
  return (
    <>
      <SEO
        title="Why Choose Us"
        description="Technical founders who understand business. Revenue-focused metrics, not vanity numbers. Based in Bhagalpur, Bihar."
        canonical="/why-choose-us"
      />
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">The Difference</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Engineers Who <span className="text-gradient">Get Business</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We are not an agency. We are technical founders who build systems that make money. 
            Every decision is filtered through revenue impact.
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
          <h2 className="text-3xl font-bold">How We Compare</h2>
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
              Ready to Build Something That Works?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Book a free strategy call. We will give you an honest assessment of your project 
              and a clear path forward.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/contact-us" className="btn-ai px-6 py-3 rounded-lg font-medium">
                Book a Strategy Call
              </a>
              <a href="/case-studies" className="px-6 py-3 rounded-lg font-medium border border-primary/50 hover:bg-primary/10 transition-colors">
                See Case Studies
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
    </>
  );
}
