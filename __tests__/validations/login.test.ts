import { loginSchema } from '@/lib/validations/auth';
import { z } from 'zod';

describe('Login Validation (Zod Schema)', () => {
  describe('Valid inputs', () => {
    it('should validate correct email and password', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should validate with minimal valid email', () => {
      const validData = {
        email: 'a@b.co',
        password: 'password',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });
  });

  describe('Invalid email', () => {
    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should reject missing @ symbol', () => {
      const invalidData = {
        email: 'useremail.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });
  });

  describe('Invalid password', () => {
    it('should reject empty password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should accept any non-empty password', () => {
      const data = {
        email: 'user@example.com',
        password: '1',
      };

      expect(() => loginSchema.parse(data)).not.toThrow();
    });
  });

  describe('Missing fields', () => {
    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'user@example.com',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should reject completely empty object', () => {
      const invalidData = {};

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });
  });

  describe('Type validation', () => {
    it('should reject non-string email', () => {
      const invalidData = {
        email: 123,
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should reject non-string password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 123,
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });
  });
});
