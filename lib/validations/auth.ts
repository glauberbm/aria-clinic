import { z } from 'zod';

/**
 * Password validation: minimum 5 chars, at least 1 uppercase, 1 number, 1 special char
 */
const passwordSchema = z
  .string()
  .min(5, 'Senha deve ter no mínimo 5 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos 1 caractere especial');

/**
 * Email validation
 */
const emailSchema = z
  .string()
  .email('Email inválido')
  .transform(email => email.toLowerCase());

/**
 * Phone number validation (optional)
 */
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Número de telefone inválido')
  .optional()
  .or(z.literal(''));

/**
 * Birth date validation (optional, must be valid date)
 */
const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD')
  .refine(date => new Date(date) < new Date(), 'Data de nascimento não pode ser no futuro')
  .optional()
  .or(z.literal(''));

/**
 * Full name validation
 */
const fullNameSchema = z
  .string()
  .min(2, 'Nome completo deve ter no mínimo 2 caracteres')
  .max(255, 'Nome completo não pode exceder 255 caracteres')
  .regex(/^[a-záéíóúãõçâêô\s'-]+$/i, 'Nome completo contém caracteres inválidos');

/**
 * Clinic ID validation (UUID)
 */
const clinicIdSchema = z
  .string()
  .uuid('ID da clínica deve ser um UUID válido')
  .optional();

/**
 * Patient Registration Schema
 */
export const registerSchema = z.object({
  full_name: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone_number: phoneSchema,
  birth_date: birthDateSchema,
  clinic_id: clinicIdSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Password Reset Request Schema
 */
export const passwordResetSchema = z.object({
  email: emailSchema,
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  full_name: fullNameSchema.optional(),
  phone_number: phoneSchema,
  birth_date: birthDateSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
