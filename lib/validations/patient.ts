import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome não pode exceder 255 caracteres'),
  email: z.string()
    .email('Email inválido'),
  phone: z.string()
    .min(10, 'Telefone inválido')
    .regex(/^\d{10,}$/, 'Telefone deve conter apenas números'),
  dob: z.string()
    .refine((date) => {
      const today = new Date();
      const birthDate = new Date(date);
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, 'Data de nascimento inválida'),
  address: z.string()
    .max(500, 'Endereço não pode exceder 500 caracteres'),
  status: z.enum(['active', 'inactive', 'archived']),
}).partial({ address: true, status: true });

export type PatientInput = z.infer<typeof patientSchema>;
