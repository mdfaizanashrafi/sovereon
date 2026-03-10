/**
 * ============================================================================
 * CONTACT FORM SUCCESS
 * ============================================================================
 * Success state display after form submission
 */

import { CheckCircle } from 'lucide-react';

export function ContactFormSuccess() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
      <p className="text-muted-foreground">
        We&apos;ve received your inquiry and will contact you soon.
      </p>
    </div>
  );
}
