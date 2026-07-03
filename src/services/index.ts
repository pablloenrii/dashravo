/**
 * RAVO OS — Services Index
 * Exporta todos os serviços
 */

export { sb } from './supabase';
export { RealtimeManager, realtimeManager } from './realtime';
export type { Lead, LeadChange } from './crm';
export { crmService } from './crm';
export type { Transaction, TransactionChange } from './finance';
export { financeService } from './finance';
export type { Goal, GoalChange } from './goals';
export { goalsService } from './goals';
export type { Customer, Support, CustomerChange, SupportChange } from './cs';
export { csService } from './cs';
export type { User, AuthCredentials, SignUpData } from './auth';
export { authService } from './auth';
