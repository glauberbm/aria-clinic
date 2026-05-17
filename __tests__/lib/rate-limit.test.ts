import { checkRateLimit, resetRateLimit, getRateLimitStatus } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  afterEach(async () => {
    // Clean up test data
    await resetRateLimit('test-ip', 'whatsapp-reminder');
    await resetRateLimit('test-ip', 'register');
  });

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      const result = await checkRateLimit('user-1', 'action', 5, 60);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should track multiple requests within limit', async () => {
      const results = [];
      for (let i = 0; i < 3; i++) {
        const result = await checkRateLimit('user-2', 'action', 5, 60);
        results.push(result);
      }

      expect(results[0].allowed).toBe(true);
      expect(results[0].remaining).toBe(4);

      expect(results[1].allowed).toBe(true);
      expect(results[1].remaining).toBe(3);

      expect(results[2].allowed).toBe(true);
      expect(results[2].remaining).toBe(2);
    });

    it('should block requests exceeding limit', async () => {
      const limit = 3;
      const identifier = 'user-3';
      const action = 'action';

      // Make 3 allowed requests
      for (let i = 0; i < limit; i++) {
        const result = await checkRateLimit(identifier, action, limit, 60);
        expect(result.allowed).toBe(true);
      }

      // 4th request should be blocked
      const blockedResult = await checkRateLimit(identifier, action, limit, 60);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });

    it('should handle WhatsApp reminder rate limit (1 per minute)', async () => {
      const patientId = 'patient-123';
      const limit = 1;
      const window = 60; // 1 minute

      // First reminder should succeed
      const first = await checkRateLimit(patientId, 'whatsapp-reminder', limit, window);
      expect(first.allowed).toBe(true);

      // Second reminder within 60 seconds should fail
      const second = await checkRateLimit(patientId, 'whatsapp-reminder', limit, window);
      expect(second.allowed).toBe(false);
      expect(second.remaining).toBe(0);
      expect(second.resetTime).toBeGreaterThan(Date.now());
    });

    it('should handle registration rate limit (5 per hour)', async () => {
      const ip = '192.168.1.1';
      const limit = 5;
      const window = 3600; // 1 hour

      // First 5 registrations should succeed
      for (let i = 0; i < limit; i++) {
        const result = await checkRateLimit(ip, 'register', limit, window);
        expect(result.allowed).toBe(true);
      }

      // 6th registration should fail
      const blocked = await checkRateLimit(ip, 'register', limit, window);
      expect(blocked.allowed).toBe(false);
    });

    it('should isolate rate limits by identifier and action', async () => {
      // Two different identifiers should have independent limits
      const result1 = await checkRateLimit('user-a', 'action-1', 2, 60);
      const result2 = await checkRateLimit('user-a', 'action-2', 2, 60);
      const result3 = await checkRateLimit('user-b', 'action-1', 2, 60);

      // All should be allowed (different combinations)
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return current status without incrementing', async () => {
      const identifier = 'user-status';
      const action = 'check';
      const limit = 5;
      const window = 60;

      // Make 2 requests
      await checkRateLimit(identifier, action, limit, window);
      await checkRateLimit(identifier, action, limit, window);

      // Check status (should not count as another request)
      const status = await getRateLimitStatus(identifier, action, limit, window);

      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(3);
    });

    it('should show 0 remaining when limit reached', async () => {
      const identifier = 'user-full';
      const action = 'test';
      const limit = 1;
      const window = 60;

      // Hit the limit
      await checkRateLimit(identifier, action, limit, window);

      const status = await getRateLimitStatus(identifier, action, limit, window);
      expect(status.allowed).toBe(false);
      expect(status.remaining).toBe(0);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier:action pair', async () => {
      const identifier = 'user-reset';
      const action = 'test';
      const limit = 1;
      const window = 60;

      // Hit limit
      await checkRateLimit(identifier, action, limit, window);
      let status = await getRateLimitStatus(identifier, action, limit, window);
      expect(status.allowed).toBe(false);

      // Reset
      await resetRateLimit(identifier, action);

      // Should be allowed again with full limit available
      status = await getRateLimitStatus(identifier, action, limit, window);
      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(limit);
    });
  });
});
