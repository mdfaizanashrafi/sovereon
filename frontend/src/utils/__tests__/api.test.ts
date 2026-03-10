/**
 * ============================================================================
 * API UTILITIES TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

// API utility functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, ...fetchConfig } = config;
  
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    },
    ...fetchConfig,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET', params });
}

async function post<T>(endpoint: string, data: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function put<T>(endpoint: string, data: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

async function patch<T>(endpoint: string, data: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

describe('API Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('apiRequest', () => {
    it('makes GET request successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);
      
      const result = await apiRequest('/api/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('makes POST request with body', async () => {
      const mockData = { id: 1 };
      const postData = { name: 'New Item' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);
      
      await apiRequest('/api/test', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
    });

    it('throws error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);
      
      await expect(apiRequest('/api/not-found')).rejects.toThrow();
    });

    it('includes query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
      
      await apiRequest('/api/search', {
        params: { q: 'test', limit: '10' },
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=test'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
    });

    it('merges custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
      
      await apiRequest('/api/test', {
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'value',
        },
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'value',
          }),
        })
      );
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });

    it('GET request', async () => {
      await get('/api/users');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('POST request', async () => {
      const data = { name: 'John' };
      await post('/api/users', data);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('PUT request', async () => {
      const data = { id: 1, name: 'Updated' };
      await put('/api/users/1', data);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      );
    });

    it('DELETE request', async () => {
      await del('/api/users/1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('PATCH request', async () => {
      const data = { name: 'Patched' };
      await patch('/api/users/1', data);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe('GET with query params', () => {
    it('includes query parameters in GET request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
      
      await get('/api/search', { page: '1', limit: '20' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(apiRequest('/api/test')).rejects.toThrow('Network error');
    });

    it('handles 401 unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);
      
      await expect(apiRequest('/api/protected')).rejects.toThrow('401');
    });

    it('handles 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);
      
      await expect(apiRequest('/api/error')).rejects.toThrow('500');
    });

    it('handles timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Timeout'));
      
      await expect(apiRequest('/api/slow')).rejects.toThrow('Timeout');
    });

    it('handles malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);
      
      await expect(apiRequest('/api/bad-json')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('Request configuration', () => {
    it('supports custom timeout', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
      
      await apiRequest('/api/test', { signal: AbortSignal.timeout(5000) });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('supports custom credentials option', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
      
      await apiRequest('/api/test', { credentials: 'include' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('supports custom mode', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
      
      await apiRequest('/api/test', { mode: 'cors' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ mode: 'cors' })
      );
    });
  });

  describe('Response types', () => {
    it('handles array response', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);
      
      const result = await get<typeof mockData>('/api/items');
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles object response', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);
      
      const result = await get<typeof mockData>('/api/item/1');
      expect(result).toEqual(mockData);
    });

    it('handles null response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);
      
      const result = await get<null>('/api/null');
      expect(result).toBeNull();
    });

    it('handles empty object response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
      
      const result = await get<Record<string, never>>('/api/empty');
      expect(result).toEqual({});
    });
  });
});
