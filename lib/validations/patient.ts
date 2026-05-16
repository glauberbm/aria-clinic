import { z } from 'zod';

export const patientRegistrationSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
  // Patient Info
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(20, 'Telefone muito longo'),
  dateOfBirth: z
    .string()
    .refine((date) => {
      const d = new Date(date);
      const today = new Date();
      return d < today && today.getFullYear() - d.getFullYear() >= 18;
    }, 'Você deve ter pelo menos 18 anos'),
  cpf: z
    .string()
    .optional()
    .refine(
      (cpf) => {
        if (!cpf) return true;
        // Remove non-digits
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.length === 11;
      },
      'CPF deve conter 11 dígitos'
    ),
  sex: z
    .enum(['Masculino', 'Feminino', 'Outro'])
    .optional(),
  clinicId: z
    .string()
    .uuid('ID da clínica inválido'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type PatientRegistrationInput = z.infer<typeof patientRegistrationSchema>;

export const patientProfileSchema = z.object({
  bloodType: z
    .enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])
    .optional(),
  heightCm: z
    .number()
    .positive('Altura deve ser maior que 0')
    .max(300, 'Altura inválida')
    .optional(),
  weightKg: z
    .number()
    .positive('Peso deve ser maior que 0')
    .max(500, 'Peso inválido')
    .optional(),
});

export type PatientProfileInput = z.infer<typeof patientProfileSchema>;

export const insuranceInfoSchema = z.object({
  providerName: z
    .string()
    .min(1, 'Nome do provedor é obrigatório')
    .max(255, 'Nome do provedor muito longo'),
  policyNumber: z
    .string()
    .min(1, 'Número da apólice é obrigatório')
    .max(255, 'Número da apólice muito longo'),
  groupNumber: z
    .string()
    .max(255, 'Número do grupo muito longo')
    .optional(),
  coverageStart: z
    .string()
    .datetime()
    .optional(),
  coverageEnd: z
    .string()
    .datetime()
    .optional(),
});

export type InsuranceInfoInput = z.infer<typeof insuranceInfoSchema>;

export const medicalHistorySchema = z.object({
  historyType: z
    .enum(['condition', 'allergy', 'medication']),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(1000, 'Descrição muito longa'),
  severity: z
    .enum(['baixa', 'media', 'alta'])
    .optional(),
});

export type MedicalHistoryInput = z.infer<typeof medicalHistorySchema>;

// Patient form schema for create/update operations
export const patientSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(20, 'Telefone muito longo'),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD'),
  address: z
    .string()
    .max(500, 'Endereço muito longo')
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['active', 'inactive', 'archived'])
    .optional()
    .or(z.literal('active')),
});

export type PatientInput = z.infer<typeof patientSchema>;
