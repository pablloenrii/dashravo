/**
 * RAVO OS — CRM Module Store
 * Gerenciamento de estado para leads e customers
 */

import { create } from 'zustand';
import { supabase } from '@/services/supabase';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'qualified' | 'contacted' | 'converted' | 'lost';
  value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CRMStore {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLeads: () => Promise<void>;
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useCRMStore = create<CRMStore>((set) => ({
  leads: [],
  isLoading: false,
  error: null,

  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ leads: data || [], isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar leads';
      set({ error: message, isLoading: false });
    }
  },

  createLead: async (lead) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select();

      if (error) throw error;

      set((state) => ({
        leads: [data[0], ...state.leads],
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar lead';
      set({ error: message, isLoading: false });
    }
  },

  updateLead: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      set((state) => ({
        leads: state.leads.map((lead) =>
          lead.id === id ? data[0] : lead
        ),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar lead';
      set({ error: message, isLoading: false });
    }
  },

  deleteLead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        leads: state.leads.filter((lead) => lead.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar lead';
      set({ error: message, isLoading: false });
    }
  },

  setError: (error) => set({ error }),
}));
