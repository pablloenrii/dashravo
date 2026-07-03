/**
 * RAVO OS — Auth Validators
 * Validação de dados de autenticação com Zod
 */

import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const SignUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não correspondem',
  path: ['confirmPassword'],
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  avatar: z.string().url('Avatar deve ser uma URL válida').optional(),
  role: z.string().optional(),
});

// Type exports
export type SignInFormData = z.infer<typeof SignInSchema>;
export type SignUpFormData = z.infer<typeof SignUpSchema>;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof UpdatePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;
