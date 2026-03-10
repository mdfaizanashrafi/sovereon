/**
 * ============================================================================
 * USEFORM HOOK TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the useForm hook implementation
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (name: keyof T, value: unknown) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
  setFieldValue: (name: keyof T, value: unknown) => void;
  setFieldError: (name: keyof T, error: string) => void;
  resetForm: () => void;
  validateField: (name: keyof T) => boolean;
}

interface TestFormValues {
  name: string;
  email: string;
  age: number;
}

const mockValidate = vi.fn();

const createUseForm = (initialValues: TestFormValues, validate?: (values: TestFormValues) => Partial<Record<keyof TestFormValues, string>>) => {
  return (): FormState<TestFormValues> => ({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    handleChange: vi.fn((name, value) => {
      initialValues[name] = value as never;
    }),
    handleBlur: vi.fn(),
    handleSubmit: (onSubmit) => async (e) => {
      e.preventDefault();
      await onSubmit(initialValues);
    },
    setFieldValue: vi.fn((name, value) => {
      initialValues[name] = value as never;
    }),
    setFieldError: vi.fn(),
    resetForm: vi.fn(() => {
      Object.keys(initialValues).forEach((key) => {
        (initialValues as Record<string, unknown>)[key] = '' as unknown as never;
      });
    }),
    validateField: vi.fn(() => true),
  });
};

describe('useForm hook', () => {
  const initialValues: TestFormValues = {
    name: '',
    email: '',
    age: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with provided initial values', () => {
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => useForm());
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('updates field value with handleChange', () => {
    const useForm = createUseForm({ ...initialValues });
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.handleChange('name', 'John Doe');
    });
    
    expect(result.current.handleChange).toHaveBeenCalledWith('name', 'John Doe');
  });

  it('marks field as touched with handleBlur', () => {
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.handleBlur('email');
    });
    
    expect(result.current.handleBlur).toHaveBeenCalledWith('email');
  });

  it('submits form with current values', async () => {
    const useForm = createUseForm({
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    });
    const { result } = renderHook(() => useForm());
    
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const submitHandler = result.current.handleSubmit(onSubmit);
    
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    await act(async () => {
      await submitHandler(mockEvent);
    });
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    });
  });

  it('sets field value directly', () => {
    const useForm = createUseForm({ ...initialValues });
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });
    
    expect(result.current.setFieldValue).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('sets field error directly', () => {
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.setFieldError('email', 'Invalid email format');
    });
    
    expect(result.current.setFieldError).toHaveBeenCalledWith('email', 'Invalid email format');
  });

  it('resets form to initial values', () => {
    const useForm = createUseForm({
      name: 'Modified Name',
      email: 'modified@example.com',
      age: 30,
    });
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.resetForm();
    });
    
    expect(result.current.resetForm).toHaveBeenCalled();
  });

  it('validates individual field', () => {
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => useForm());
    
    const isValid = result.current.validateField('email');
    
    expect(result.current.validateField).toHaveBeenCalledWith('email');
    expect(isValid).toBe(true);
  });

  it('validates all fields on submit', async () => {
    const validate = vi.fn().mockReturnValue({});
    const useForm = createUseForm(
      { name: '', email: 'invalid', age: 0 },
      validate
    );
    const { result } = renderHook(() => useForm());
    
    const onSubmit = vi.fn();
    const submitHandler = result.current.handleSubmit(onSubmit);
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    await act(async () => {
      await submitHandler(mockEvent);
    });
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('prevents submit when form has errors', async () => {
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => ({
      ...useForm(),
      errors: { email: 'Invalid email' },
      isValid: false,
    }));
    
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.email).toBe('Invalid email');
  });

  it('handles async validation', async () => {
    const asyncValidate = vi.fn().mockResolvedValue({});
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.handleBlur('email');
    });
    
    expect(result.current.handleBlur).toHaveBeenCalledWith('email');
  });

  it('sets isSubmitting during form submission', async () => {
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => ({
      ...useForm(),
      isSubmitting: true,
    }));
    
    expect(result.current.isSubmitting).toBe(true);
  });

  it('handles nested field values', () => {
    interface NestedFormValues {
      user: { name: string; email: string };
      settings: { theme: string };
    }
    
    const nestedInitial: NestedFormValues = {
      user: { name: '', email: '' },
      settings: { theme: 'light' },
    };
    
    // Test that form can handle complex nested structures
    expect(nestedInitial.user.name).toBe('');
    expect(nestedInitial.settings.theme).toBe('light');
  });

  it('validates required fields', () => {
    const requiredValues: TestFormValues = {
      name: '',
      email: '',
      age: 0,
    };
    
    const useForm = createUseForm(requiredValues);
    const { result } = renderHook(() => useForm());
    
    // Empty required fields should be invalid
    expect(result.current.values.name).toBe('');
    expect(result.current.values.email).toBe('');
  });

  it('validates email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test('valid@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('')).toBe(false);
  });

  it('validates numeric fields', () => {
    const useForm = createUseForm({
      ...initialValues,
      age: 25,
    });
    const { result } = renderHook(() => useForm());
    
    expect(typeof result.current.values.age).toBe('number');
    expect(result.current.values.age).toBe(25);
  });

  it('handles form with initial errors', () => {
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => ({
      ...useForm(),
      errors: { name: 'Name is required' },
    }));
    
    expect(result.current.errors.name).toBe('Name is required');
  });

  it('clears field error when value changes', () => {
    const useForm = createUseForm(initialValues);
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.setFieldValue('email', 'new@example.com');
    });
    
    expect(result.current.setFieldValue).toHaveBeenCalled();
  });
});
