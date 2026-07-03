/**
 * RAVO OS — Goals Validators
 * Validação de dados de metas com Zod
 */

import { z } from 'zod';

export const CreateGoalSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  category: z.enum(['vendas', 'marketing', 'operacional', 'financeiro', 'rh']),
  targetValue: z.number().min(1, 'Valor alvo deve ser maior que 0'),
  currentValue: z.number().min(0, 'Valor atual não pode ser negativo').default(0),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inicial inválida'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data final inválida'),
  owner: z.string().optional(),
  status: z.enum(['ativo', 'pausado', 'concluído', 'falhado']).default('ativo'),
});

export const UpdateGoalSchema = CreateGoalSchema.partial();

export const UpdateGoalProgressSchema = z.object({
  currentValue: z.number().min(0, 'Valor atual não pode ser negativo'),
});

export const GoalFilterSchema = z.object({
  category: z.enum(['vendas', 'marketing', 'operacional', 'financeiro', 'rh']).optional(),
  status: z.enum(['ativo', 'pausado', 'concluído', 'falhado']).optional(),
  owner: z.string().optional(),
});

// Type exports
export type CreateGoalFormData = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalFormData = z.infer<typeof UpdateGoalSchema>;
export type UpdateGoalProgressFormData = z.infer<typeof UpdateGoalProgressSchema>;
export type GoalFilterData = z.infer<typeof GoalFilterSchema>;
