/**
 * RAVO OS — CRM Validators
 * Validação de dados de CRM com Zod
 */

import { z } from 'zod';

export const CreateLeadSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['novo', 'qualificado', 'negotiation', 'fechado']),
  value: z.number().min(0, 'Valor deve ser positivo').optional(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

export const LeadFilterSchema = z.object({
  status: z.enum(['novo', 'qualificado', 'negotiation', 'fechado']).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  search: z.string().optional(),
});

// Type exports
export type CreateLeadFormData = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof UpdateLeadSchema>;
export type LeadFilterData = z.infer<typeof LeadFilterSchema>;
