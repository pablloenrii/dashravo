/**
 * RAVO OS — Customer Success Service
 * Gerencia clientes, suporte e satisfação com real-time
 */

import { sb } from './supabase';
import { realtimeManager } from './realtime';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  contractValue: number;
  contractStartDate: string;
  contractEndDate?: string;
  status: 'ativo' | 'churn' | 'pausado' | 'prospect';
  nps?: number; // Net Promoter Score (0-10)
  healthScore?: number; // 0-100
  manager?: string;
  created_at: string;
  updated_at: string;
}

export interface Support {
  id: string;
  customerId: string;
  title: string;
  description: string;
  priority: 'baixa' | 'média' | 'alta' | 'crítica';
  category: 'técnico' | 'faturamento' | 'funcionalidade' | 'outro';
  status: 'aberto' | 'em_progresso' | 'resolvido' | 'fechado';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CustomerChange {
  onInsert?: (customer: Customer) => void;
  onUpdate?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export interface SupportChange {
  onInsert?: (ticket: Support) => void;
  onUpdate?: (ticket: Support) => void;
  onDelete?: (ticket: Support) => void;
}

/**
 * Customer Success Service
 */
class CSService {
  private customersTable = 'customers';
  private supportTable = 'support_tickets';

  // ========== CUSTOMERS ==========

  /**
   * Buscar todos os clientes
   */
  async getCustomers() {
    const { data, error } = await sb
      .from(this.customersTable)
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      return [];
    }
    return (data as Customer[]) || [];
  }

  /**
   * Buscar cliente por ID
   */
  async getCustomerById(id: string) {
    const { data, error } = await sb
      .from(this.customersTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar cliente:', error);
      return null;
    }
    return data as Customer;
  }

  /**
   * Buscar clientes em risco (churn)
   */
  async getAtRiskCustomers() {
    const { data, error } = await sb
      .from(this.customersTable)
      .select('*')
      .lt('healthScore', 50)
      .eq('status', 'ativo');

    if (error) {
      console.error('❌ Erro ao buscar clientes em risco:', error);
      return [];
    }
    return (data as Customer[]) || [];
  }

  /**
   * Criar cliente
   */
  async createCustomer(
    customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await sb
      .from(this.customersTable)
      .insert([customer])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar cliente:', error);
      return null;
    }
    return data as Customer;
  }

  /**
   * Atualizar cliente
   */
  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await sb
      .from(this.customersTable)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      return null;
    }
    return data as Customer;
  }

  /**
   * Subscrever a mudanças em clientes
   */
  subscribeToCustomers(callbacks: CustomerChange) {
    return realtimeManager.subscribe(this.customersTable, {
      onInsert: callbacks.onInsert,
      onUpdate: callbacks.onUpdate,
      onDelete: callbacks.onDelete,
    });
  }

  /**
   * Calcular MRR (Monthly Recurring Revenue)
   */
  async getMRR() {
    const customers = await this.getCustomers();
    return customers
      .filter((c) => c.status === 'ativo')
      .reduce((sum, c) => sum + c.contractValue / 12, 0);
  }

  // ========== SUPPORT TICKETS ==========

  /**
   * Buscar tickets de suporte
   */
  async getSupportTickets() {
    const { data, error } = await sb
      .from(this.supportTable)
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar tickets:', error);
      return [];
    }
    return (data as Support[]) || [];
  }

  /**
   * Buscar tickets abertos
   */
  async getOpenTickets() {
    const { data, error } = await sb
      .from(this.supportTable)
      .select('*')
      .neq('status', 'fechado')
      .order('priority', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar tickets abertos:', error);
      return [];
    }
    return (data as Support[]) || [];
  }

  /**
   * Criar ticket de suporte
   */
  async createSupportTicket(
    ticket: Omit<Support, 'id' | 'createdAt' | 'resolvedAt'>
  ) {
    const { data, error } = await sb
      .from(this.supportTable)
      .insert([{ ...ticket, createdAt: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar ticket:', error);
      return null;
    }
    return data as Support;
  }

  /**
   * Atualizar ticket
   */
  async updateSupportTicket(id: string, updates: Partial<Support>) {
    const { data, error } = await sb
      .from(this.supportTable)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar ticket:', error);
      return null;
    }
    return data as Support;
  }

  /**
   * Resolver ticket
   */
  async resolveTicket(id: string) {
    return this.updateSupportTicket(id, {
      status: 'resolvido',
      resolvedAt: new Date().toISOString(),
    });
  }

  /**
   * Subscrever a mudanças em tickets
   */
  subscribeToTickets(callbacks: SupportChange) {
    return realtimeManager.subscribe(this.supportTable, {
      onInsert: callbacks.onInsert,
      onUpdate: callbacks.onUpdate,
      onDelete: callbacks.onDelete,
    });
  }

  /**
   * Tempo médio de resolução
   */
  async getAverageResolutionTime() {
    const { data, error } = await sb
      .from(this.supportTable)
      .select('createdAt, resolvedAt')
      .neq('status', 'aberto');

    if (error) {
      console.error('❌ Erro ao calcular tempo médio:', error);
      return 0;
    }

    const tickets = (data as Pick<Support, 'createdAt' | 'resolvedAt'>[]) || [];
    if (tickets.length === 0) return 0;

    const times = tickets
      .filter((t) => t.resolvedAt)
      .map((t) => {
        const created = new Date(t.createdAt).getTime();
        const resolved = new Date(t.resolvedAt!).getTime();
        return (resolved - created) / (1000 * 60 * 60); // em horas
      });

    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }
}

// Singleton
export const csService = new CSService();
