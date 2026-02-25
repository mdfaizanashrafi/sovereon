/**
 * ============================================================================
 * FAQ PAGE
 * ============================================================================
 * 
 * Displays frequently asked questions dynamically from CMS
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cmsApi } from '@/services/cmsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO, buildFAQSchema } from '@/components/SEO';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const response = await cmsApi.getFAQs();
        if (response.success) {
          setFaqs((response.data as FAQ[]) || []);
        }
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQs();
  }, []);

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Skeleton className="h-8 w-full max-w-xs mx-auto mb-4" />
          <Skeleton className="h-4 w-full max-w-xl mx-auto mb-8" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Frequently Asked Questions"
        description="Common questions about our software development, AI services, and digital marketing. Based in Bhagalpur, serving clients across India."
        canonical="/faq"
        schema={buildFAQSchema(faqs.map(f => ({ question: f.question, answer: f.answer })))}
      />
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">FAQ</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Common <span className="text-gradient">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Straight answers about timelines, pricing, process, and what to expect when working with us.
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-3xl mx-auto space-y-8">
          {Object.entries(groupedFAQs).map(([category, categoryFaqs]) => (
            <Card key={category} className="ai-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {categoryFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
