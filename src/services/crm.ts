/**
 * RAVO OS — CRM Service
 * Gerencia clientes, leads e contatos com real-time
 */

import { sb } from './supabase';
import { realtimeManager } from './realtime';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'novo' | 'qualificado' | 'negotiation' | 'fechado';
  value?: number;
  created_at: string;
  updated_at: string;
}

export interface LeadChange {
  onInsert?: (lead: Lead) => void;
  onUpdate?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

/**
 * CRM Service - Gerencia clientes e leads
 */
class CRMService {
  private tableName = 'leads';

  /**
   * Buscar todos os leads
   */
  async getLeads() {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar leads:', error);
      return [];
    }
    return (data as Lead[]) || [];
  }

  /**
   * Buscar lead por ID
   */
  async getLeadById(id: string) {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar lead:', error);
      return null;
    }
    return data as Lead;
  }

  /**
   * Criar novo lead
   */
  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await sb
      .from(this.tableName)
      .insert([lead])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar lead:', error);
      return null;
    }
    return data as Lead;
  }

  /**
   * Atualizar lead
   */
  async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await sb
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar lead:', error);
      return null;
    }
    return data as Lead;
  }

  /**
   * Deletar lead
   */
  async deleteLead(id: string) {
    const { error } = await sb
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar lead:', error);
      return false;
    }
    return true;
  }

  /**
   * Subscrever a mudanças em leads (real-time)
   */
  subscribeToLeads(callbacks: LeadChange) {
    return realtimeManager.subscribe(this.tableName, {
      onInsert: callbacks.onInsert,
      onUpdate: callbacks.onUpdate,
      onDelete: callbacks.onDelete,
    });
  }

  /**
   * Filtrar leads por status
   */
  async getLeadsByStatus(status: Lead['status']) {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*')
      .eq('status', status);

    if (error) {
      console.error('❌ Erro ao filtrar leads:', error);
      return [];
    }
    return (data as Lead[]) || [];
  }
}

// Singleton
export const crmService = new CRMService();
