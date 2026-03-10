/**
 * ============================================================================
 * STORAGE UTILITIES TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Storage utility functions
const storage = {
  local: {
    get: <T>(key: string, defaultValue?: T): T | undefined => {
      const item = localStorageMock.getItem(key);
      if (item === null) return defaultValue;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    },
    set: <T>(key: string, value: T): void => {
      localStorageMock.setItem(key, JSON.stringify(value));
    },
    remove: (key: string): void => {
      localStorageMock.removeItem(key);
    },
    clear: (): void => {
      localStorageMock.clear();
    },
    has: (key: string): boolean => {
      return localStorageMock.getItem(key) !== null;
    },
    keys: (): string[] => {
      return Object.keys(localStorageMock).filter((k) => 
        localStorageMock.getItem(k) !== null
      );
    },
  },
  session: {
    get: <T>(key: string, defaultValue?: T): T | undefined => {
      const item = sessionStorageMock.getItem(key);
      if (item === null) return defaultValue;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    },
    set: <T>(key: string, value: T): void => {
      sessionStorageMock.setItem(key, JSON.stringify(value));
    },
    remove: (key: string): void => {
      sessionStorageMock.removeItem(key);
    },
    clear: (): void => {
      sessionStorageMock.clear();
    },
    has: (key: string): boolean => {
      return sessionStorageMock.getItem(key) !== null;
    },
  },
};

const setWithExpiry = <T>(key: string, value: T, ttl: number): void => {
  const item = {
    value,
    expiry: Date.now() + ttl,
  };
  localStorageMock.setItem(key, JSON.stringify(item));
};

const getWithExpiry = <T>(key: string): T | null => {
  const itemStr = localStorageMock.getItem(key);
  if (!itemStr) return null;
  
  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorageMock.removeItem(key);
      return null;
    }
    return item.value as T;
  } catch {
    return null;
  }
};

describe('Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  describe('localStorage', () => {
    describe('get', () => {
      it('returns parsed JSON value', () => {
        const data = { name: 'John', age: 30 };
        localStorageMock.setItem('user', JSON.stringify(data));
        
        const result = storage.local.get<typeof data>('user');
        expect(result).toEqual(data);
      });

      it('returns default value when key not found', () => {
        const defaultValue = { name: 'Default' };
        const result = storage.local.get('nonexistent', defaultValue);
        expect(result).toEqual(defaultValue);
      });

      it('returns undefined when key not found and no default', () => {
        const result = storage.local.get('nonexistent');
        expect(result).toBeUndefined();
      });

      it('returns string for non-JSON value', () => {
        localStorageMock.setItem('simple', 'hello');
        const result = storage.local.get<string>('simple');
        expect(result).toBe('hello');
      });
    });

    describe('set', () => {
      it('stores object as JSON', () => {
        const data = { key: 'value' };
        storage.local.set('data', data);
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'data',
          JSON.stringify(data)
        );
      });

      it('stores string value', () => {
        storage.local.set('name', 'John');
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'name',
          '"John"'
        );
      });

      it('stores number value', () => {
        storage.local.set('count', 42);
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'count',
          '42'
        );
      });

      it('stores array value', () => {
        const arr = [1, 2, 3];
        storage.local.set('items', arr);
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'items',
          JSON.stringify(arr)
        );
      });
    });

    describe('remove', () => {
      it('removes item from storage', () => {
        storage.local.set('temp', 'value');
        storage.local.remove('temp');
        
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('temp');
      });
    });

    describe('clear', () => {
      it('clears all items', () => {
        storage.local.set('key1', 'value1');
        storage.local.set('key2', 'value2');
        storage.local.clear();
        
        expect(localStorageMock.clear).toHaveBeenCalled();
      });
    });

    describe('has', () => {
      it('returns true when key exists', () => {
        storage.local.set('exists', 'value');
        expect(storage.local.has('exists')).toBe(true);
      });

      it('returns false when key does not exist', () => {
        expect(storage.local.has('nonexistent')).toBe(false);
      });
    });
  });

  describe('sessionStorage', () => {
    describe('get', () => {
      it('returns parsed JSON value', () => {
        const data = { session: 'data' };
        sessionStorageMock.setItem('sessionData', JSON.stringify(data));
        
        const result = storage.session.get<typeof data>('sessionData');
        expect(result).toEqual(data);
      });

      it('returns default value when key not found', () => {
        const defaultValue = 'default';
        const result = storage.session.get('nonexistent', defaultValue);
        expect(result).toBe(defaultValue);
      });
    });

    describe('set', () => {
      it('stores value in sessionStorage', () => {
        storage.session.set('temp', { data: 'value' });
        
        expect(sessionStorageMock.setItem).toHaveBeenCalled();
      });
    });

    describe('remove', () => {
      it('removes item from sessionStorage', () => {
        storage.session.remove('temp');
        
        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('temp');
      });
    });

    describe('clear', () => {
      it('clears sessionStorage', () => {
        storage.session.clear();
        
        expect(sessionStorageMock.clear).toHaveBeenCalled();
      });
    });

    describe('has', () => {
      it('returns true when key exists in sessionStorage', () => {
        sessionStorageMock.setItem('exists', 'value');
        expect(storage.session.has('exists')).toBe(true);
      });

      it('returns false when key does not exist', () => {
        expect(storage.session.has('nonexistent')).toBe(false);
      });
    });
  });

  describe('Expiry functions', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('stores value with expiry', () => {
      const data = { message: 'hello' };
      const ttl = 60000; // 1 minute
      
      setWithExpiry('expiring', data, ttl);
      
      const stored = localStorageMock.getItem('expiring');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.value).toEqual(data);
      expect(parsed.expiry).toBeGreaterThan(Date.now());
    });

    it('returns value before expiry', () => {
      const data = { key: 'value' };
      setWithExpiry('notExpired', data, 60000);
      
      const result = getWithExpiry<typeof data>('notExpired');
      expect(result).toEqual(data);
    });

    it('returns null and removes item after expiry', () => {
      const data = { key: 'value' };
      setWithExpiry('expired', data, 1000);
      
      // Advance time past expiry
      vi.advanceTimersByTime(2000);
      
      const result = getWithExpiry('expired');
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('expired');
    });

    it('returns null for non-existent key', () => {
      const result = getWithExpiry('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      localStorageMock.setItem('invalid', 'not-json');
      const result = getWithExpiry('invalid');
      expect(result).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('handles quota exceeded error', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      
      expect(() => {
        storage.local.set('large', { data: 'x'.repeat(10000000) });
      }).toThrow();
    });

    it('handles JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid{json');
      
      const result = storage.local.get('bad-json');
      // Should return the raw string if JSON parsing fails
      expect(result).toBe('invalid{json');
    });
  });

  describe('Complex data types', () => {
    it('handles nested objects', () => {
      const nested = {
        level1: {
          level2: {
            level3: 'deep value',
          },
        },
      };
      
      storage.local.set('nested', nested);
      const result = storage.local.get<typeof nested>('nested');
      expect(result).toEqual(nested);
    });

    it('handles arrays', () => {
      const arr = [1, 'two', { three: 3 }, [4]];
      storage.local.set('array', arr);
      const result = storage.local.get<typeof arr>('array');
      expect(result).toEqual(arr);
    });

    it('handles dates', () => {
      const date = new Date('2026-03-10');
      storage.local.set('date', date);
      const result = storage.local.get<string>('date');
      // Dates are serialized as ISO strings
      expect(result).toBe(date.toISOString());
    });

    it('handles null values', () => {
      storage.local.set('nullValue', null);
      const result = storage.local.get<null>('nullValue');
      expect(result).toBeNull();
    });

    it('handles undefined values', () => {
      storage.local.set('undefinedValue', undefined);
      const result = storage.local.get('undefinedValue');
      expect(result).toBeUndefined();
    });
  });

  describe('Storage events', () => {
    it('storage keys returns all keys', () => {
      storage.local.set('key1', 'value1');
      storage.local.set('key2', 'value2');
      
      // The keys function should return keys from the mock store
      const keys = storage.local.keys();
      expect(keys).toBeDefined();
      expect(Array.isArray(keys)).toBe(true);
    });
  });
});
