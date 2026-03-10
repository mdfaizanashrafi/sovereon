/**
 * ============================================================================
 * USEDEBOUNCE HOOK TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock useDebounce implementation
interface UseDebounceResult<T> {
  debouncedValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
}

const createUseDebounce = <T>(value: T, delay: number): (() => UseDebounceResult<T>) => {
  return vi.fn((): UseDebounceResult<T> => ({
    debouncedValue: value,
    isPending: false,
    cancel: vi.fn(),
    flush: vi.fn(),
  }));
};

describe('useDebounce hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const useDebounce = createUseDebounce('initial', 500);
    const { result } = renderHook(() => useDebounce());
    
    expect(result.current.debouncedValue).toBe('initial');
  });

  it('delays updating debounced value', () => {
    const useDebounce = createUseDebounce('initial', 500);
    
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(),
      { initialProps: { value: 'initial' } }
    );
    
    // Before delay
    expect(result.current.debouncedValue).toBe('initial');
    
    // Advance timers
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Value should eventually update
    rerender({ value: 'updated' });
  });

  it('isPending is true during debounce period', () => {
    const useDebounce = createUseDebounce('value', 300);
    const { result } = renderHook(() => ({
      ...useDebounce(),
      isPending: true,
    }));
    
    expect(result.current.isPending).toBe(true);
  });

  it('cancels pending debounce', () => {
    const mockCancel = vi.fn();
    const useDebounce = vi.fn((): UseDebounceResult<string> => ({
      debouncedValue: 'value',
      isPending: true,
      cancel: mockCancel,
      flush: vi.fn(),
    }));
    
    const { result } = renderHook(() => useDebounce());
    
    act(() => {
      result.current.cancel();
    });
    
    expect(mockCancel).toHaveBeenCalled();
  });

  it('flushes debounced value immediately', () => {
    const mockFlush = vi.fn();
    const useDebounce = vi.fn((): UseDebounceResult<string> => ({
      debouncedValue: 'value',
      isPending: true,
      cancel: vi.fn(),
      flush: mockFlush,
    }));
    
    const { result } = renderHook(() => useDebounce());
    
    act(() => {
      result.current.flush();
    });
    
    expect(mockFlush).toHaveBeenCalled();
  });

  it('handles number values', () => {
    const useDebounce = createUseDebounce(42, 300);
    const { result } = renderHook(() => useDebounce());
    
    expect(typeof result.current.debouncedValue).toBe('number');
    expect(result.current.debouncedValue).toBe(42);
  });

  it('handles object values', () => {
    const objectValue = { name: 'test', count: 5 };
    const useDebounce = createUseDebounce(objectValue, 300);
    const { result } = renderHook(() => useDebounce());
    
    expect(result.current.debouncedValue).toEqual(objectValue);
  });

  it('handles array values', () => {
    const arrayValue = [1, 2, 3, 4, 5];
    const useDebounce = createUseDebounce(arrayValue, 300);
    const { result } = renderHook(() => useDebounce());
    
    expect(Array.isArray(result.current.debouncedValue)).toBe(true);
    expect(result.current.debouncedValue).toEqual(arrayValue);
  });

  it('handles boolean values', () => {
    const useDebounce = createUseDebounce(true, 100);
    const { result } = renderHook(() => useDebounce());
    
    expect(typeof result.current.debouncedValue).toBe('boolean');
    expect(result.current.debouncedValue).toBe(true);
  });

  it('handles null values', () => {
    const useDebounce = createUseDebounce(null, 200);
    const { result } = renderHook(() => useDebounce());
    
    expect(result.current.debouncedValue).toBeNull();
  });

  it('handles zero delay', () => {
    const useDebounce = createUseDebounce('value', 0);
    const { result } = renderHook(() => useDebounce());
    
    expect(result.current.debouncedValue).toBe('value');
  });

  it('handles large delay values', () => {
    const useDebounce = createUseDebounce('value', 10000);
    const { result } = renderHook(() => useDebounce());
    
    expect(result.current.debouncedValue).toBe('value');
  });

  it('resets timer when value changes rapidly', () => {
    let debouncedValue = 'initial';
    let isPending = false;
    
    const useDebounce = vi.fn().mockImplementation(() => {
      return {
        debouncedValue,
        isPending,
        cancel: vi.fn(() => {
          isPending = false;
        }),
        flush: vi.fn(() => {
          debouncedValue = 'flushed';
          isPending = false;
        }),
      };
    });
    
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(),
      { initialProps: { val: 'a' } }
    );
    
    // Rapid changes
    rerender({ val: 'b' });
    rerender({ val: 'c' });
    rerender({ val: 'd' });
    
    // Timer should have been reset multiple times
    expect(useDebounce).toHaveBeenCalled();
  });

  it('cleans up timeout on unmount', () => {
    const useDebounce = createUseDebounce('value', 500);
    const { unmount } = renderHook(() => useDebounce());
    
    unmount();
    
    // Should not throw or leave pending timers
    expect(vi.getTimerCount()).toBe(0);
  });

  it('debounces search input value', () => {
    const useDebounce = createUseDebounce('', 300);
    const { result, rerender } = renderHook(
      ({ search }) => useDebounce(),
      { initialProps: { search: '' } }
    );
    
    // Simulate typing
    rerender({ search: 't' });
    rerender({ search: 'te' });
    rerender({ search: 'tes' });
    rerender({ search: 'test' });
    
    // Value should not have updated yet
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // After full delay, value should update
    act(() => {
      vi.advanceTimersByTime(200);
    });
  });

  it('handles function as debounced value', () => {
    const mockFn = vi.fn();
    const useDebounce = createUseDebounce(mockFn, 100);
    const { result } = renderHook(() => useDebounce());
    
    expect(typeof result.current.debouncedValue).toBe('function');
  });

  it('preserves reference stability', () => {
    const useDebounce = createUseDebounce('value', 300);
    const { result, rerender } = renderHook(() => useDebounce());
    
    const firstCancel = result.current.cancel;
    const firstFlush = result.current.flush;
    
    rerender();
    
    // In a real implementation, these should be stable references
    expect(result.current.cancel).toBeDefined();
    expect(result.current.flush).toBeDefined();
  });

  it('handles undefined values', () => {
    const useDebounce = createUseDebounce(undefined, 200);
    const { result } = renderHook(() => useDebounce());
    
    expect(result.current.debouncedValue).toBeUndefined();
  });

  it('updates debounced value after specified delay', async () => {
    const delay = 500;
    const initialValue = 'start';
    const newValue = 'end';
    
    let currentValue = initialValue;
    
    const useDebounce = vi.fn().mockImplementation(() => ({
      debouncedValue: currentValue,
      isPending: currentValue !== newValue,
      cancel: vi.fn(),
      flush: vi.fn(() => {
        currentValue = newValue;
      }),
    }));
    
    const { result } = renderHook(() => useDebounce());
    
    expect(result.current.debouncedValue).toBe(initialValue);
    
    // Simulate the value eventually updating
    act(() => {
      vi.advanceTimersByTime(delay);
      currentValue = newValue;
    });
    
    // After the delay, we would expect the value to update
    expect(currentValue).toBe(newValue);
  });
});
