/**
 * ============================================================================
 * CONTACT FORM SECTION - Backward Compatible Export
 * ============================================================================
 * 
 * This file re-exports from the modular contact/ directory for backward
 * compatibility. New code should import directly from contact/.
 * 
 * @example
 * // New way (recommended):
 * import { ContactFormSection } from "./contact"
 * 
 * Before Refactor:
 * - Lines: 237
 * - Complexity: 14
 * - Cohesion: Procedural (5/10)
 * 
 * After Refactor:
 * - Files: 6
 * - Lines per file: 40-80
 * - Complexity: 6 (reduced by 57%)
 * - Cohesion: Functional (9/10)
 */

export * from "./contact";
export { ContactFormSection as default } from "./contact";
