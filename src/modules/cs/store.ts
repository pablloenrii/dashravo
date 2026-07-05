/**
 * RAVO OS — Customer Success Module Store
 */

import { create } from 'zustand';
import { sb as supabase } from '@/services/supabase';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  customer_id: string;
  created_at: string;
  updated_at: string;
}

export interface CSStore {
  tickets: SupportTicket[];
  isLoading: boolean;
  error: string | null;

  fetchTickets: () => Promise<void>;
  createTicket: (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTicket: (id: string, ticket: Partial<SupportTicket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useCSStore = create<CSStore>((set) => ({
  tickets: [],
  isLoading: false,
  error: null,

  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tickets: data || [], isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar tickets';
      set({ error: message, isLoading: false });
    }
  },

  createTicket: async (ticket) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([ticket])
        .select();

      if (error) throw error;

      set((state) => ({
        tickets: [data[0], ...state.tickets],
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar ticket';
      set({ error: message, isLoading: false });
    }
  },

  updateTicket: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? data[0] : t)),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar ticket';
      set({ error: message, isLoading: false });
    }
  },

  deleteTicket: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar ticket';
      set({ error: message, isLoading: false });
    }
  },

  setError: (error) => set({ error }),
}));
