import { registerSchema, loginSchema } from '@/lib/validations/auth';

describe('Auth Validations', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        full_name: 'Test User',
        email: 'invalid-email',
        password: 'ValidPass123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email inválido');
      }
    });

    it('should reject short name', () => {
      const invalidData = {
        full_name: 'A',
        email: 'test@example.com',
        password: 'ValidPass123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'validpass123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });


    it('should reject password without number', () => {
      const invalidData = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const invalidData = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject too short password', () => {
      const invalidData = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'Pass12',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
