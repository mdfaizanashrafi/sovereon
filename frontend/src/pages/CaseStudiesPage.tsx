/**
 * ============================================================================
 * CASE STUDIES PAGE
 * ============================================================================
 * 
 * Features:
 * - Client success stories
 * - Before/after results
 * - Industry-specific examples
 * - Challenge/Solution/Results format
 * 
 * PLACEHOLDERS:
 * - [PLACEHOLDER_CASE_STUDY_IMAGE_*]: Case study images
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Building2, CheckCircle } from 'lucide-react';
import { caseStudies } from '@/data/siteData';
import { SEO } from '@/components/SEO';

export function CaseStudiesPage() {
  return (
    <>
      <SEO
        title="Case Studies"
        description="See how we have helped businesses across India grow revenue, reduce costs, and scale operations with custom software and AI systems."
        canonical="/case-studies"
      />
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Proven Results</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Case <span className="text-gradient">Studies</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Real projects, real outcomes. Every case study includes actual metrics 
            and the specific challenges we solved.
          </p>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((study, index) => (
            <Card
              key={study.id}
              className="ai-card group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                {/* Image Placeholder */}
                <div className="h-48 bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-primary/30" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{study.industry}</Badge>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">{study.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{study.client}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Challenge</h3>
                      <p className="text-sm text-muted-foreground">{study.challenge}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Solution</h3>
                      <p className="text-sm text-muted-foreground">{study.solution}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <h3 className="text-sm font-medium mb-2">Results:</h3>
                    <ul className="space-y-1">
                      {study.results.map((result) => (
                        <li key={result} className="flex items-center gap-2 text-sm text-primary">
                          <CheckCircle className="w-4 h-4" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <Card className="ai-card bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-8 md:p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready for Similar Results?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Book a free strategy call. We will analyze your situation and give you an honest assessment of what is possible.
            </p>
            <a href="/contact-us" className="btn-ai inline-flex items-center px-6 py-3 rounded-lg font-medium">
              Book a Strategy Call
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
    </>
  );
}
