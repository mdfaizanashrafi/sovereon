/**
 * ============================================================================
 * CONTACT FORM SUCCESS TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactFormSuccess } from '../contact-form-success';

describe('ContactFormSuccess', () => {
  it('renders success message', () => {
    render(<ContactFormSuccess />);
    
    expect(screen.getByText('Thank You!')).toBeInTheDocument();
    expect(screen.getByText(/received your inquiry/i)).toBeInTheDocument();
  });
});
