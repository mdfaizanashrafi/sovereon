/**
 * ============================================================================
 * CONTACT FORM SECTION
 * ============================================================================
 * Consultation form section with clean composition
 * 
 * Refactored: Extracted form logic and UI to separate files
 * - Complexity: 14 → 6
 * - Lines: 237 → 40
 * - Cohesion: Procedural → Functional
 */

import { Badge } from '@/components/ui/badge';
import { ContactForm } from './contact-form';

export function ContactFormSection() {
  return (
    <section className="section-padding bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="badge-ai mb-4">Get Started</Badge>
            <h2 className="text-responsive-section font-bold mb-4">
              Get Your Free <span className="text-gradient">AI Consultation</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us about your project and we&apos;ll get back to you within 24 hours
            </p>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}

export default ContactFormSection;
