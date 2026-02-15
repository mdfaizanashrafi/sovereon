/**
 * ============================================================================
 * FAQ PAGE
 * ============================================================================
 * 
 * Features:
 * - Timeline information
 * - Refund policy
 * - Common doubts/questions
 * - Payment methods
 * - Organized by category
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Clock, RefreshCw, HelpCircle, CreditCard, MessageCircle } from 'lucide-react';
import { faqItems } from '@/data/siteData';

const categories = [
  { id: 'Timeline', icon: Clock, label: 'Project Timeline' },
  { id: 'Refund Policy', icon: RefreshCw, label: 'Refund Policy' },
  { id: 'Payments', icon: CreditCard, label: 'Payment Methods' },
  { id: 'AI Technology', icon: MessageCircle, label: 'AI & Technology' },
  { id: 'Support', icon: HelpCircle, label: 'Support' },
  { id: 'General', icon: HelpCircle, label: 'General' },
  { id: 'Security', icon: HelpCircle, label: 'Security' },
];

export function FAQPage() {
  const groupedFAQs = faqItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof faqItems>);

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Help Center</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about our services, 
            processes, and policies.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id.toLowerCase().replace(' ', '-')}`}
              className="ai-card p-4 text-center hover:border-primary/50 transition-colors"
            >
              <cat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">{cat.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {Object.entries(groupedFAQs).map(([category, items]) => (
              <Card key={category} className="ai-card" id={category.toLowerCase().replace(' ', '-')}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{category}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((item) => (
                      <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="ai-card bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Still Have Questions?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find what you're looking for? Reach out to our team 
                  and we'll get back to you within 24 hours.
                </p>
                <a href="/contact-us" className="btn-ai block text-center py-2 rounded-lg font-medium">
                  Contact Us
                </a>
              </CardContent>
            </Card>

            <Card className="ai-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Facts</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Avg. response: &lt;2 hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">14-day refund policy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Multiple payment options</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
