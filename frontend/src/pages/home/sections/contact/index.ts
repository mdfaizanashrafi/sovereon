/**
 * ============================================================================
 * CONTACT FORM SECTION - Barrel Export
 * ============================================================================
 * 
 * Refactored from 237 lines to modular components:
 * - use-contact-form.ts: Form state logic
 * - contact-form-fields.tsx: Input fields
 * - contact-form-submit.tsx: Submit button
 * - contact-form-success.tsx: Success state
 * - contact-form.tsx: Form composition
 * 
 * Complexity reduced: 14 → 6
 * Cohesion improved: Procedural → Functional
 */

export { ContactFormSection } from './contact-form-section';
export { ContactForm } from './contact-form';
export { useContactForm } from './use-contact-form';
export { ContactFormSuccess } from './contact-form-success';
export { ContactFormFields } from './contact-form-fields';
export { ContactFormSubmit } from './contact-form-submit';
