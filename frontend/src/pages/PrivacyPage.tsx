/**
 * ============================================================================
 * PRIVACY POLICY PAGE
 * ============================================================================
 * 
 * Standard privacy policy content.
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// No icons needed for this page

export function PrivacyPage() {
  return (
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="badge-ai mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: February 2026
            </p>
          </div>

          <Card className="ai-card">
            <CardContent className="p-8">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground">
                  At Sovereon Inc., we take your privacy seriously. This Privacy Policy 
                  describes how we collect, use, and protect your personal information.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                  <li>Name and contact information</li>
                  <li>Company details</li>
                  <li>Payment information</li>
                  <li>Project requirements and communications</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                  <li>Provide and improve our services</li>
                  <li>Communicate with you about projects</li>
                  <li>Process payments</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect 
                  your personal data against unauthorized access, alteration, disclosure, or 
                  destruction.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">4. Your Rights</h2>
                <p className="text-muted-foreground">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">5. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
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
