/**
 * ============================================================================
 * CONTACT FORM SUBMIT BUTTON
 * ============================================================================
 * Submit button with loading state
 */

import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactFormSubmitProps {
  isSubmitting: boolean;
}

export function ContactFormSubmit({ isSubmitting }: ContactFormSubmitProps) {
  return (
    <Button
      type="submit"
      className="w-full btn-ai"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Sending...
        </>
      ) : (
        <>
          Send Inquiry
          <Send className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}
