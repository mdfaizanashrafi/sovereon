/**
 * ============================================================================
 * USE CONTACT FORM TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContactForm } from '../use-contact-form';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useContactForm', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('initializes with empty form data', () => {
    const { result } = renderHook(() => useContactForm());
    
    expect(result.current.formData).toEqual({
      name: '',
      email: '',
      phone: '',
      service: '',
      message: '',
      company_website: '',
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('updates form data on handleChange', () => {
    const { result } = renderHook(() => useContactForm());
    
    act(() => {
      result.current.handleChange('name', 'John Doe');
    });
    
    expect(result.current.formData.name).toBe('John Doe');
  });

  it('sets isSubmitting during form submission', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    
    const { result } = renderHook(() => useContactForm());
    
    act(() => {
      result.current.handleSubmit(new Event('submit') as any);
    });
    
    expect(result.current.isSubmitting).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  it('handles form submission', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    
    const { result } = renderHook(() => useContactForm());
    
    // Just verify submission state changes
    act(() => {
      result.current.handleSubmit(new Event('submit') as any);
    });
    
    expect(result.current.isSubmitting).toBe(true);
  });
});
