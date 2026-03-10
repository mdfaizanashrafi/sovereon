/**
 * ============================================================================
 * CONTACT FORM
 * ============================================================================
 * Main contact form component with error handling
 */

import { Card, CardContent } from '@/components/ui/card';
import { ContactFormFields } from './contact-form-fields';
import { ContactFormSubmit } from './contact-form-submit';
import { ContactFormSuccess } from './contact-form-success';
import { useContactForm } from './use-contact-form';
// ServiceCategory type removed - not used in this component

export function ContactForm() {
  const {
    formData,
    categories,
    isSubmitting,
    isSubmitted,
    error,
    handleChange,
    handleSubmit,
  } = useContactForm();

  if (isSubmitted) {
    return (
      <Card className="ai-card">
        <CardContent className="p-6 md:p-8">
          <ContactFormSuccess />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="ai-card">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}
          
          <ContactFormFields
            formData={formData}
            categories={categories}
            onChange={handleChange}
          />

          <ContactFormSubmit isSubmitting={isSubmitting} />
        </form>
      </CardContent>
    </Card>
  );
}
