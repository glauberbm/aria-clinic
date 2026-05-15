import { z } from 'zod';

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  avatar_url: z
    .string()
    .url('Avatar URL inválida')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'Arquivo deve ter no máximo 5MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png'].includes(file.type),
      'Apenas JPEG e PNG são permitidos'
    ),
});

export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
