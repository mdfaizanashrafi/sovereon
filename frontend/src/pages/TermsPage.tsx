/**
 * ============================================================================
 * TERMS OF SERVICE PAGE
 * ============================================================================
 * 
 * Standard terms of service content.
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// No icons needed for this page

export function TermsPage() {
  return (
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="badge-ai mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: February 2026
            </p>
          </div>

          <Card className="ai-card">
            <CardContent className="p-8">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground">
                  By accessing or using Sovereon Inc.'s services, you agree to be bound by 
                  these Terms of Service.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">1. Services</h2>
                <p className="text-muted-foreground">
                  Sovereon Inc. provides digital marketing, software development, and related 
                  services as described on our website. We reserve the right to modify or 
                  discontinue services at any time.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">2. Payment Terms</h2>
                <p className="text-muted-foreground">
                  Payment terms are as follows:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                  <li>50% advance payment required to start projects</li>
                  <li>Remaining 50% due upon project completion</li>
                  <li>Monthly services billed in advance</li>
                  <li>Late payments subject to 2% monthly service charge</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">3. Refund Policy</h2>
                <p className="text-muted-foreground">
                  We offer refunds under the following conditions:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                  <li>Full refund within 14 days if unsatisfied</li>
                  <li>Prorated refunds for ongoing projects</li>
                  <li>No refunds for completed deliverables</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  Upon full payment, all deliverables become the property of the client. 
                  We retain the right to use non-confidential work samples for portfolio 
                  purposes unless otherwise agreed.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">5. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  Sovereon Inc.'s liability is limited to the amount paid for services. 
                  We are not liable for indirect, incidental, or consequential damages.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">6. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these terms, contact us at:
                  <br />
                  Email: contact@sovereoninc.com
                  <br />
                  Phone: 8789109928
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
