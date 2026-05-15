import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

/**
 * Create a mock Supabase client for testing
 */
export function createMockSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Generate a valid JWT token for testing
 */
export function generateTestJWT(
  userId: string,
  email: string,
  expiresIn: number = 3600
) {
  const secret = process.env.JWT_SECRET || 'test-secret';

  return jwt.sign(
    {
      sub: userId,
      email,
      role: 'patient',
      aud: 'authenticated',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    },
    secret
  );
}

/**
 * Mock Supabase Auth for RLS testing
 */
export async function mockSupabaseAuth(userId: string, email: string) {
  const token = generateTestJWT(userId, email);

  return {
    token,
    user: {
      id: userId,
      email,
      user_metadata: {
        name: 'Test User',
      },
    },
  };
}

/**
 * Create test data for patient registration
 */
export function createPatientTestData(overrides?: Partial<any>) {
  return {
    name: 'Test Patient',
    email: `test-${Date.now()}@example.com`,
    phone: '11987654321',
    dateOfBirth: '1990-01-01',
    cpf: '12345678901',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    ...overrides,
  };
}

/**
 * Validate patient registration request
 */
export function validatePatientRegistration(data: any) {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Invalid email';
  if (!data.phone?.match(/^\d{11}$/)) errors.phone = 'Phone must have 11 digits';
  if (!data.cpf?.match(/^\d{11}$/)) errors.cpf = 'CPF must have 11 digits';
  if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';

  const dob = new Date(data.dateOfBirth);
  const age = (new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 18) errors.dateOfBirth = 'Patient must be at least 18 years old';

  if (!data.password?.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Mock RLS policy enforcement
 */
export function mockRLSPolicy(userId: string, requestingUserId: string) {
  return userId === requestingUserId;
}

/**
 * Create mock insurance data
 */
export function createInsuranceTestData(overrides?: Partial<any>) {
  return {
    provider: 'Unimed',
    policyNumber: `UNM-${Date.now()}`,
    coverage: ['clinic', 'hospitalization'],
    ...overrides,
  };
}

/**
 * Create mock medical history data
 */
export function createMedicalHistoryTestData(
  type: 'condition' | 'allergy' | 'medication' = 'condition',
  overrides?: Partial<any>
) {
  return {
    type,
    description: `Test ${type}`,
    recordedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Cleanup test data from database
 */
export async function cleanupTestData(userId: string) {
  const supabase = createMockSupabaseClient();

  // Delete medical history
  await supabase
    .from('medical_history')
    .delete()
    .eq('patient_id', userId);

  // Delete insurance info
  await supabase
    .from('insurance_info')
    .delete()
    .eq('patient_id', userId);

  // Delete patient profile
  await supabase
    .from('patient_profiles')
    .delete()
    .eq('user_id', userId);

  // Delete auth user
  await supabase.auth.admin?.deleteUser(userId);
}

/**
 * Mock file upload for avatar testing
 */
export function createMockFile(
  name: string = 'test-avatar.jpg',
  type: string = 'image/jpeg',
  size: number = 1024
) {
  const buffer = Buffer.alloc(size);
  return new File([buffer], name, { type });
}

/**
 * Assert privacy enforcement in test
 */
export function assertPrivacyEnforced(userAData: any, userBData: any) {
  // User B should not have access to User A's private fields
  const privateFields = [
    'cpf',
    'medicalHistory',
    'insuranceInfo',
    'avatar_url',
  ];

  return !privateFields.some(field =>
    JSON.stringify(userBData).includes(JSON.stringify(userAData[field]))
  );
}
