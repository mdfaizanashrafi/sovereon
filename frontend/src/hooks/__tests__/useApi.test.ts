/**
 * ============================================================================
 * USEAPI HOOK TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '../useApi';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useApi hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('returns loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useApi('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('returns data on successful fetch', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useApi('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('returns error on failed fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ success: false, error: { message: 'Not found' } }),
    });

    const { result } = renderHook(() => useApi('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('refetch function reloads data', async () => {
    const mockData1 = { version: 1 };
    const mockData2 = { version: 2 };
    
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData2 }),
      });

    const { result } = renderHook(() => useApi('/api/test'));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    // Refetch
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });
  });
});
