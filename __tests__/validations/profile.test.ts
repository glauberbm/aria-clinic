import { profileUpdateSchema, avatarUploadSchema } from '@/lib/validations/profile';

describe('profileUpdateSchema', () => {
  it('should validate correct profile update data', () => {
    const validData = {
      name: 'João Silva',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate profile update with empty avatar_url', () => {
    const validData = {
      name: 'Maria Santos',
      avatar_url: '',
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate profile update without avatar_url', () => {
    const validData = {
      name: 'João Silva',
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject name shorter than 2 characters', () => {
    const invalidData = {
      name: 'A',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres');
    }
  });

  it('should reject name longer than 255 characters', () => {
    const invalidData = {
      name: 'A'.repeat(256),
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('muito longo');
    }
  });

  it('should reject invalid avatar URL', () => {
    const invalidData = {
      name: 'João Silva',
      avatar_url: 'not-a-valid-url',
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('inválida');
    }
  });

  it('should accept optional avatar_url field', () => {
    const validData = {
      name: 'João Silva',
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('avatarUploadSchema', () => {
  it('should validate correct avatar file (JPEG)', () => {
    const file = new File(['dummy content'], 'avatar.jpg', { type: 'image/jpeg' });
    const validData = {
      file,
    };

    const result = avatarUploadSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate correct avatar file (PNG)', () => {
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const validData = {
      file,
    };

    const result = avatarUploadSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject file larger than 5MB', () => {
    // Create a file mock that is 6MB
    const largeContent = new Array(6 * 1024 * 1024 + 1).fill('x').join('');
    const file = new File([largeContent], 'avatar.jpg', { type: 'image/jpeg' });

    const result = avatarUploadSchema.safeParse({ file });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('5MB');
    }
  });

  it('should reject non-image file types', () => {
    const file = new File(['dummy content'], 'avatar.pdf', { type: 'application/pdf' });
    const result = avatarUploadSchema.safeParse({ file });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('JPEG');
    }
  });

  it('should reject GIF files', () => {
    const file = new File(['dummy content'], 'avatar.gif', { type: 'image/gif' });
    const result = avatarUploadSchema.safeParse({ file });
    expect(result.success).toBe(false);
  });

  it('should accept 5MB file exactly', () => {
    const content = new Array(5 * 1024 * 1024).fill('x').join('');
    const file = new File([content], 'avatar.jpg', { type: 'image/jpeg' });

    const result = avatarUploadSchema.safeParse({ file });
    expect(result.success).toBe(true);
  });
});
