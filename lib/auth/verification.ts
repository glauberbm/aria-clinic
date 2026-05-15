import crypto from 'crypto';

export interface VerificationToken {
  token: string;
  expiresAt: string;
}

/**
 * Generate a secure verification token valid for 24 hours
 */
export function generateVerificationToken(): VerificationToken {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  return {
    token,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Verify if a token has expired
 */
export function isTokenExpired(expiresAtString: string): boolean {
  const expiresAt = new Date(expiresAtString);
  return expiresAt < new Date();
}
