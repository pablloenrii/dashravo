/**
 * RAVO OS — CRM Store
 * Estado global para CRM com Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { crmService, type Lead } from '@/services/crm';

interface CRMStore {
  // State
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  selectedLead: Lead | null;

  // Actions
  fetchLeads: () => Promise<void>;
  fetchLeadsByStatus: (status: Lead['status']) => Promise<void>;
  selectLead: (lead: Lead | null) => void;
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addLead: (lead: Lead) => void;
  removeLead: (id: string) => void;
  updateLeadInStore: (id: string, updates: Partial<Lead>) => void;
  subscribeToLeads: () => void;
}

export const useCRMStore = create<CRMStore>()(
  devtools((set, get) => ({
    // State
    leads: [],
    isLoading: false,
    error: null,
    selectedLead: null,

    // Actions
    fetchLeads: async () => {
      set({ isLoading: true, error: null });
      try {
        const leads = await crmService.getLeads();
        set({ leads, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao buscar leads',
          isLoading: false,
        });
      }
    },

    fetchLeadsByStatus: async (status) => {
      set({ isLoading: true, error: null });
      try {
        const leads = await crmService.getLeadsByStatus(status);
        set({ leads, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao filtrar leads',
          isLoading: false,
        });
      }
    },

    selectLead: (lead) => {
      set({ selectedLead: lead });
    },

    createLead: async (lead) => {
      set({ isLoading: true, error: null });
      try {
        const newLead = await crmService.createLead(lead);
        if (newLead) {
          set({
            leads: [...get().leads, newLead],
            isLoading: false,
          });
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao criar lead',
          isLoading: false,
        });
      }
    },

    updateLead: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await crmService.updateLead(id, updates);
        if (updated) {
          const leads = get().leads.map((l) => (l.id === id ? updated : l));
          set({
            leads,
            selectedLead: get().selectedLead?.id === id ? updated : get().selectedLead,
            isLoading: false,
          });
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao atualizar lead',
          isLoading: false,
        });
      }
    },

    deleteLead: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const success = await crmService.deleteLead(id);
        if (success) {
          const leads = get().leads.filter((l) => l.id !== id);
          set({
            leads,
            selectedLead: get().selectedLead?.id === id ? null : get().selectedLead,
            isLoading: false,
          });
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao deletar lead',
          isLoading: false,
        });
      }
    },

    // Real-time updates
    addLead: (lead) => {
      set({ leads: [...get().leads, lead] });
    },

    removeLead: (id) => {
      const leads = get().leads.filter((l) => l.id !== id);
      set({
        leads,
        selectedLead: get().selectedLead?.id === id ? null : get().selectedLead,
      });
    },

    updateLeadInStore: (id, updates) => {
      const leads = get().leads.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      );
      set({
        leads,
        selectedLead:
          get().selectedLead?.id === id
            ? { ...get().selectedLead!, ...updates }
            : get().selectedLead,
      });
    },

    subscribeToLeads: () => {
      crmService.subscribeToLeads({
        onInsert: (lead) => get().addLead(lead),
        onUpdate: (lead) => get().updateLeadInStore(lead.id, lead),
        onDelete: (lead) => get().removeLead(lead.id),
      });
    },
  }))
);
