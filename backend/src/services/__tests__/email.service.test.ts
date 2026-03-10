/**
 * ============================================================================
 * EMAIL SERVICE TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateEmailConfig,
  getEmailHealth,
  sendAdminNotification,
  sendIntelligentAutoReply,
  verifyEmailService,
} from '../email.service';

// Mock Resend
const mockSend = vi.fn();
const mockList = vi.fn();

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
    apiKeys: { list: mockList },
  })),
}));

describe('Email Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEmailConfig', () => {
    it('should return valid when RESEND_API_KEY is set', () => {
      process.env.RESEND_API_KEY = 'test-key';

      const result = validateEmailConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when RESEND_API_KEY is not set', () => {
      delete process.env.RESEND_API_KEY;

      const result = validateEmailConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('RESEND_API_KEY not set - contact forms will fail');
    });
  });

  describe('getEmailHealth', () => {
    it('should return current health status', () => {
      const health = getEmailHealth();

      expect(health).toHaveProperty('lastCheck');
      expect(health).toHaveProperty('isHealthy');
    });
  });

  describe('sendAdminNotification', () => {
    it('should return false when email config is invalid', async () => {
      delete process.env.RESEND_API_KEY;

      const result = await sendAdminNotification({
        name: 'John',
        email: 'john@example.com',
        message: 'Test message',
        formType: 'contact',
        createdAt: new Date(),
      });

      expect(result).toBe(false);
    });

    it('should send notification successfully', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.FROM_EMAIL = 'test@example.com';
      process.env.ADMIN_EMAIL = 'admin@example.com';
      mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

      const result = await sendAdminNotification({
        name: 'John',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Acme Inc',
        service: 'Web Development',
        message: 'Test message',
        formType: 'consultation',
        createdAt: new Date(),
      });

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
          to: 'admin@example.com',
          subject: expect.stringContaining('John'),
          html: expect.stringContaining('John'),
          text: expect.stringContaining('John'),
        })
      );
    });

    it('should handle send error with retries', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      mockSend
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { id: 'email-1' }, error: null });

      const result = await sendAdminNotification({
        name: 'John',
        email: 'john@example.com',
        message: 'Test',
        formType: 'contact',
        createdAt: new Date(),
      });

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('should return false after all retries fail', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      mockSend.mockRejectedValue(new Error('Persistent error'));

      const result = await sendAdminNotification({
        name: 'John',
        email: 'john@example.com',
        message: 'Test',
        formType: 'contact',
        createdAt: new Date(),
      });

      expect(result).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('should handle Resend API error response', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid API key' } });

      const result = await sendAdminNotification({
        name: 'John',
        email: 'john@example.com',
        message: 'Test',
        formType: 'contact',
        createdAt: new Date(),
      });

      expect(result).toBe(false);
    });

    it('should include all optional fields in email', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.FROM_EMAIL = 'test@example.com';
      mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

      await sendAdminNotification({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Inc',
        service: 'AI Solutions',
        message: 'I need help with AI automation',
        formType: 'consultation',
        createdAt: new Date('2025-01-01'),
      });

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('John Doe');
      expect(callArgs.html).toContain('john@example.com');
      expect(callArgs.html).toContain('+1234567890');
      expect(callArgs.html).toContain('Acme Inc');
      expect(callArgs.html).toContain('AI Solutions');
    });
  });

  describe('sendIntelligentAutoReply', () => {
    it('should return false when email config is invalid', async () => {
      delete process.env.RESEND_API_KEY;

      const result = await sendIntelligentAutoReply(
        'john@example.com',
        'John',
        'Test message'
      );

      expect(result).toBe(false);
    });

    it('should send AI automation category reply', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.FROM_EMAIL = 'test@example.com';
      mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

      const result = await sendIntelligentAutoReply(
        'john@example.com',
        'John',
        'I am interested in AI and automation solutions'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: expect.stringContaining('AI'),
          html: expect.stringContaining('John'),
        })
      );
    });

    it('should send SEO category reply', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.FROM_EMAIL = 'test@example.com';
      mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

      const result = await sendIntelligentAutoReply(
        'john@example.com',
        'John',
        'I need help with SEO and Google ranking'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('SEO'),
        })
      );
    });

    it('should send development category reply', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.FROM_EMAIL = 'test@example.com';
      mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

      const result = await sendIntelligentAutoReply(
        'john@example.com',
        'John',
        'I need a website and mobile app development'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Development'),
        })
      );
    });

    it('should send digital marketing category reply', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.FROM_EMAIL = 'test@example.com';
      mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

      const result = await sendIntelligentAutoReply(
        'john@example.com',
        'John',
        'I need help with marketing and advertising campaigns'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Digital Marketing'),
        })
      );
    });

    it('should send general category reply by default', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.FROM_EMAIL = 'test@example.com';
      mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

      const result = await sendIntelligentAutoReply(
        'john@example.com',
        'John',
        'Hello, I have a general inquiry'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Sovereon'),
        })
      );
    });

    it('should use service parameter for categorization', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.FROM_EMAIL = 'test@example.com';
      mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

      const result = await sendIntelligentAutoReply(
        'john@example.com',
        'John',
        'Hello',
        'AI Automation'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('AI'),
        })
      );
    });

    it('should handle send error with retries', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      mockSend
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { id: 'email-1' }, error: null });

      const result = await sendIntelligentAutoReply(
        'john@example.com',
        'John',
        'Test'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyEmailService', () => {
    it('should return false when API key is not set', async () => {
      delete process.env.RESEND_API_KEY;

      const result = await verifyEmailService();

      expect(result).toBe(false);
    });

    it('should verify service successfully', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      mockList.mockResolvedValue({ data: [], error: null });

      const result = await verifyEmailService();

      expect(result).toBe(true);
    });

    it('should handle verification error', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      mockList.mockResolvedValue({ data: null, error: { message: 'Invalid key' } });

      const result = await verifyEmailService();

      expect(result).toBe(false);
    });

    it('should handle exception during verification', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      mockList.mockRejectedValue(new Error('Network error'));

      const result = await verifyEmailService();

      expect(result).toBe(false);
    });
  });
});
