/**
 * RAVO OS — Finance Validators
 * Validação de dados financeiros com Zod
 */

import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  type: z.enum(['receita', 'despesa']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z.number().min(0.01, 'Valor deve ser maior que 0'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inválida'),
  status: z.enum(['pendente', 'confirmado', 'cancelado']),
  reference: z.string().optional(),
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial();

export const TransactionFilterSchema = z.object({
  type: z.enum(['receita', 'despesa']).optional(),
  category: z.string().optional(),
  status: z.enum(['pendente', 'confirmado', 'cancelado']).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Type exports
export type CreateTransactionFormData = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionFormData = z.infer<typeof UpdateTransactionSchema>;
export type TransactionFilterData = z.infer<typeof TransactionFilterSchema>;
