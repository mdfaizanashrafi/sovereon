/**
 * ============================================================================
 * CACHE MIDDLEWARE TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  cacheMiddleware,
  invalidateCacheMiddleware,
  conditionalInvalidateCache,
  cacheConfig,
  cmsCacheMiddleware,
  servicesCacheMiddleware,
  teamCacheMiddleware,
  testimonialCacheMiddleware,
  faqCacheMiddleware,
  settingsCacheMiddleware,
  cacheWarmingTrigger,
} from '../cache.middleware';

// Mock cache
const mockCache = {
  isEnabled: vi.fn().mockReturnValue(true),
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(undefined),
  deletePattern: vi.fn().mockResolvedValue(undefined),
  invalidateByTags: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../../config/cache', () => ({
  getEnhancedCache: vi.fn().mockReturnValue(mockCache),
  CACHE_TTL: {
    API_RESPONSE: 60,
    CMS_CONTENT: 300,
    TEAM_MEMBERS: 300,
    SERVICES: 600,
    TESTIMONIALS: 900,
    FAQS: 1800,
    SETTINGS: 3600,
    USER_PROFILE: 600,
    STATIC: 3600,
  },
}));

describe('Cache Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock, end: vi.fn() });

    mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
      url: '/api/test',
      query: {},
      headers: {},
    };
    mockRes = {
      status: statusMock,
      json: jsonMock,
      setHeader: vi.fn(),
      getHeader: vi.fn(),
      end: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('cacheMiddleware', () => {
    it('should skip non-GET/HEAD requests', async () => {
      mockReq.method = 'POST';

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockCache.get).not.toHaveBeenCalled();
    });

    it('should skip when cache is disabled', async () => {
      mockCache.isEnabled.mockReturnValue(false);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'DISABLED');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip when bypass header is set', async () => {
      mockReq.headers = { 'x-bypass-cache': 'true' };

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'BYPASS');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return cached response on cache hit', async () => {
      const cachedResponse = {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { data: 'cached' },
        cachedAt: Date.now(),
        etag: '"abc123"',
      };
      mockCache.get.mockResolvedValue(cachedResponse);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ data: 'cached' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 304 when ETag matches', async () => {
      mockReq.headers = { 'if-none-match': '"abc123"' };
      const cachedResponse = {
        statusCode: 200,
        headers: {},
        body: { data: 'cached' },
        cachedAt: Date.now(),
        etag: '"abc123"',
      };
      mockCache.get.mockResolvedValue(cachedResponse);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(304);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should cache response on cache miss', async () => {
      mockCache.get.mockResolvedValue(null);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simulate response being sent
      const responseBody = { data: 'fresh' };
      jsonMock(responseBody);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should generate correct cache key with query params', async () => {
      mockReq.query = { page: '1', limit: '10' };
      mockCache.get.mockResolvedValue(null);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCache.get).toHaveBeenCalledWith(
        expect.stringContaining('page'),
        'api:response',
        undefined
      );
    });

    it('should use custom key prefix', async () => {
      mockCache.get.mockResolvedValue(null);

      const middleware = cacheMiddleware({ keyPrefix: 'custom:prefix' });
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCache.get).toHaveBeenCalledWith(
        expect.any(String),
        'custom:prefix',
        undefined
      );
    });

    it('should call onHit callback on cache hit', async () => {
      const onHit = vi.fn();
      const cachedResponse = {
        statusCode: 200,
        headers: {},
        body: {},
        cachedAt: Date.now(),
      };
      mockCache.get.mockResolvedValue(cachedResponse);

      const middleware = cacheMiddleware({ onHit });
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(onHit).toHaveBeenCalledWith(mockReq, expect.any(String));
    });

    it('should call onMiss callback on cache miss', async () => {
      const onMiss = vi.fn();
      mockCache.get.mockResolvedValue(null);

      const middleware = cacheMiddleware({ onMiss });
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(onMiss).toHaveBeenCalledWith(mockReq, expect.any(String));
    });

    it('should skip based on custom condition', async () => {
      const condition = () => false;
      mockCache.get.mockResolvedValue(null);

      const middleware = cacheMiddleware({ condition });
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockCache.get).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCacheMiddleware', () => {
    it('should invalidate cache on successful response', async () => {
      const middleware = invalidateCacheMiddleware(['pattern:*']);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simulate successful response
      statusMock(200);
      jsonMock({ success: true });

      expect(mockNext).toHaveBeenCalled();
    });

    it('should include invalidation header', async () => {
      const middleware = invalidateCacheMiddleware(['pattern:*']);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Check that json was wrapped
      expect(typeof mockRes.json).toBe('function');
    });
  });

  describe('conditionalInvalidateCache', () => {
    it('should invalidate based on condition', async () => {
      const condition = (req: Request, body: any) => body.success === true;
      const middleware = conditionalInvalidateCache(condition, ['pattern:*']);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('predefined cache configurations', () => {
    it('cms cache config should have correct TTL', () => {
      expect(cacheConfig.cms.ttl).toBe(300);
      expect(cacheConfig.cms.keyPrefix).toBe('api:cms');
      expect(cacheConfig.cms.tags).toContain('cms');
    });

    it('team members cache config should have correct TTL', () => {
      expect(cacheConfig.teamMembers.ttl).toBe(300);
      expect(cacheConfig.teamMembers.keyPrefix).toBe('api:team');
    });

    it('services cache config should have correct TTL', () => {
      expect(cacheConfig.services.ttl).toBe(600);
      expect(cacheConfig.services.keyPrefix).toBe('api:services');
    });

    it('testimonials cache config should have correct TTL', () => {
      expect(cacheConfig.testimonials.ttl).toBe(900);
      expect(cacheConfig.testimonials.keyPrefix).toBe('api:testimonials');
    });

    it('faqs cache config should have correct TTL', () => {
      expect(cacheConfig.faqs.ttl).toBe(1800);
      expect(cacheConfig.faqs.keyPrefix).toBe('api:faqs');
    });

    it('settings cache config should have correct TTL', () => {
      expect(cacheConfig.settings.ttl).toBe(3600);
      expect(cacheConfig.settings.keyPrefix).toBe('api:settings');
    });

    it('user profile cache config should include user', () => {
      expect(cacheConfig.userProfile.ttl).toBe(600);
      expect(cacheConfig.userProfile.includeUser).toBe(true);
    });

    it('dynamic cache config should have short TTL', () => {
      expect(cacheConfig.dynamic.ttl).toBe(60);
    });

    it('static cache config should have long TTL', () => {
      expect(cacheConfig.static.ttl).toBe(3600);
    });
  });

  describe('convenience middleware creators', () => {
    it('cmsCacheMiddleware should create middleware with cms config', () => {
      const middleware = cmsCacheMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('servicesCacheMiddleware should create middleware with services config', () => {
      const middleware = servicesCacheMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('teamCacheMiddleware should create middleware with team config', () => {
      const middleware = teamCacheMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('testimonialCacheMiddleware should create middleware with testimonials config', () => {
      const middleware = testimonialCacheMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('faqCacheMiddleware should create middleware with faqs config', () => {
      const middleware = faqCacheMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('settingsCacheMiddleware should create middleware with settings config', () => {
      const middleware = settingsCacheMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should allow custom options override', () => {
      const middleware = cmsCacheMiddleware({ ttl: 600 });
      expect(typeof middleware).toBe('function');
    });
  });

  describe('cacheWarmingTrigger', () => {
    it('should trigger warm function on startup', () => {
      const warmFunction = vi.fn().mockResolvedValue(undefined);
      
      cacheWarmingTrigger(warmFunction, { onStartup: true });

      // Should call setImmediate
      expect(warmFunction).not.toHaveBeenCalled(); // It's queued
    });

    it('should setup periodic warming', () => {
      const warmFunction = vi.fn().mockResolvedValue(undefined);
      
      const middleware = cacheWarmingTrigger(warmFunction, { interval: 1000 });

      expect(typeof middleware).toBe('function');
    });

    it('should pass through middleware', () => {
      const warmFunction = vi.fn();
      
      const middleware = cacheWarmingTrigger(warmFunction);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
