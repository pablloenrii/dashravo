/**
 * RAVO OS — CS Validators
 * Validação de dados de Customer Success com Zod
 */

import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Empresa é obrigatória'),
  contractValue: z.number().min(0, 'Valor do contrato deve ser positivo'),
  contractStartDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inválida'),
  contractEndDate: z.string().optional(),
  status: z.enum(['ativo', 'churn', 'pausado', 'prospect']),
  nps: z.number().min(0).max(10).optional(),
  healthScore: z.number().min(0).max(100).optional(),
  manager: z.string().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CreateSupportTicketSchema = z.object({
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  priority: z.enum(['baixa', 'média', 'alta', 'crítica']),
  category: z.enum(['técnico', 'faturamento', 'funcionalidade', 'outro']),
  status: z.enum(['aberto', 'em_progresso', 'resolvido', 'fechado']).default('aberto'),
  assignedTo: z.string().optional(),
});

export const UpdateSupportTicketSchema = CreateSupportTicketSchema.partial();

export const CustomerFilterSchema = z.object({
  status: z.enum(['ativo', 'churn', 'pausado', 'prospect']).optional(),
  manager: z.string().optional(),
  minHealthScore: z.number().optional(),
});

export const TicketFilterSchema = z.object({
  priority: z.enum(['baixa', 'média', 'alta', 'crítica']).optional(),
  category: z.enum(['técnico', 'faturamento', 'funcionalidade', 'outro']).optional(),
  status: z.enum(['aberto', 'em_progresso', 'resolvido', 'fechado']).optional(),
  customerId: z.string().optional(),
});

// Type exports
export type CreateCustomerFormData = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof UpdateCustomerSchema>;
export type CreateSupportTicketFormData = z.infer<typeof CreateSupportTicketSchema>;
export type UpdateSupportTicketFormData = z.infer<typeof UpdateSupportTicketSchema>;
export type CustomerFilterData = z.infer<typeof CustomerFilterSchema>;
export type TicketFilterData = z.infer<typeof TicketFilterSchema>;
