/**
 * ============================================================================
 * USE CONTACT FORM HOOK
 * ============================================================================
 * Custom hook for managing contact form state and submission
 */

import { useState, useEffect, useCallback } from 'react';
import { cmsApi } from '@/services/cmsApi';
import type { ServiceCategory } from '../../types';

const API_URL = import.meta.env.VITE_API_URL;

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  company_website: string; // Honeypot
}

interface UseContactFormReturn {
  formData: FormData;
  categories: ServiceCategory[];
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  handleChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  company_website: '',
};

export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load service categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await cmsApi.getServiceCategories();
        if (response.success) {
          setCategories((response.data as ServiceCategory[]) || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setError(null);
      } else {
        const data = await response.json().catch(() => ({ 
          error: { message: 'Submission failed. Please try again.' } 
        }));
        setError(data.error?.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return {
    formData,
    categories,
    isSubmitting,
    isSubmitted,
    error,
    handleChange,
    handleSubmit,
  };
}
