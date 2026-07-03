/**
 * RAVO OS — CS Store
 * Estado global para Customer Success com Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { csService, type Customer, type Support } from '@/services/cs';

interface CSStore {
  // State - Customers
  customers: Customer[];
  atRiskCustomers: Customer[];
  isLoadingCustomers: boolean;
  errorCustomers: string | null;
  mrr: number;

  // State - Tickets
  tickets: Support[];
  openTickets: Support[];
  isLoadingTickets: boolean;
  errorTickets: string | null;
  avgResolutionTime: number;

  // Actions - Customers
  fetchCustomers: () => Promise<void>;
  fetchAtRiskCustomers: () => Promise<void>;
  fetchMRR: () => Promise<void>;
  createCustomer: (
    customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  addCustomer: (customer: Customer) => void;
  updateCustomerInStore: (id: string, updates: Partial<Customer>) => void;

  // Actions - Tickets
  fetchTickets: () => Promise<void>;
  fetchOpenTickets: () => Promise<void>;
  fetchAvgResolutionTime: () => Promise<void>;
  createTicket: (
    ticket: Omit<Support, 'id' | 'createdAt' | 'resolvedAt'>
  ) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Support>) => Promise<void>;
  resolveTicket: (id: string) => Promise<void>;
  addTicket: (ticket: Support) => void;
  updateTicketInStore: (id: string, updates: Partial<Support>) => void;

  // Subscribe
  subscribeToCustomers: () => void;
  subscribeToTickets: () => void;
}

export const useCSStore = create<CSStore>()(
  devtools((set, get) => ({
    // State
    customers: [],
    atRiskCustomers: [],
    isLoadingCustomers: false,
    errorCustomers: null,
    mrr: 0,
    tickets: [],
    openTickets: [],
    isLoadingTickets: false,
    errorTickets: null,
    avgResolutionTime: 0,

    // ========== CUSTOMERS ==========

    fetchCustomers: async () => {
      set({ isLoadingCustomers: true, errorCustomers: null });
      try {
        const customers = await csService.getCustomers();
        set({ customers, isLoadingCustomers: false });
      } catch (error) {
        set({
          errorCustomers: error instanceof Error ? error.message : 'Erro ao buscar clientes',
          isLoadingCustomers: false,
        });
      }
    },

    fetchAtRiskCustomers: async () => {
      try {
        const atRiskCustomers = await csService.getAtRiskCustomers();
        set({ atRiskCustomers });
      } catch (error) {
        console.error('Erro ao buscar clientes em risco:', error);
      }
    },

    fetchMRR: async () => {
      try {
        const mrr = await csService.getMRR();
        set({ mrr });
      } catch (error) {
        console.error('Erro ao calcular MRR:', error);
      }
    },

    createCustomer: async (customer) => {
      set({ isLoadingCustomers: true, errorCustomers: null });
      try {
        const newCustomer = await csService.createCustomer(customer);
        if (newCustomer) {
          set({
            customers: [...get().customers, newCustomer],
            isLoadingCustomers: false,
          });
          await get().fetchMRR();
        }
      } catch (error) {
        set({
          errorCustomers: error instanceof Error ? error.message : 'Erro ao criar cliente',
          isLoadingCustomers: false,
        });
      }
    },

    updateCustomer: async (id, updates) => {
      set({ isLoadingCustomers: true, errorCustomers: null });
      try {
        const updated = await csService.updateCustomer(id, updates);
        if (updated) {
          const customers = get().customers.map((c) => (c.id === id ? updated : c));
          set({
            customers,
            isLoadingCustomers: false,
          });
          await get().fetchMRR();
          await get().fetchAtRiskCustomers();
        }
      } catch (error) {
        set({
          errorCustomers: error instanceof Error ? error.message : 'Erro ao atualizar cliente',
          isLoadingCustomers: false,
        });
      }
    },

    addCustomer: (customer) => {
      set({ customers: [...get().customers, customer] });
    },

    updateCustomerInStore: (id, updates) => {
      const customers = get().customers.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      set({ customers });
    },

    // ========== TICKETS ==========

    fetchTickets: async () => {
      set({ isLoadingTickets: true, errorTickets: null });
      try {
        const tickets = await csService.getSupportTickets();
        set({ tickets, isLoadingTickets: false });
      } catch (error) {
        set({
          errorTickets: error instanceof Error ? error.message : 'Erro ao buscar tickets',
          isLoadingTickets: false,
        });
      }
    },

    fetchOpenTickets: async () => {
      try {
        const openTickets = await csService.getOpenTickets();
        set({ openTickets });
      } catch (error) {
        console.error('Erro ao buscar tickets abertos:', error);
      }
    },

    fetchAvgResolutionTime: async () => {
      try {
        const avgResolutionTime = await csService.getAverageResolutionTime();
        set({ avgResolutionTime });
      } catch (error) {
        console.error('Erro ao calcular tempo médio:', error);
      }
    },

    createTicket: async (ticket) => {
      set({ isLoadingTickets: true, errorTickets: null });
      try {
        const newTicket = await csService.createSupportTicket(ticket);
        if (newTicket) {
          set({
            tickets: [...get().tickets, newTicket],
            isLoadingTickets: false,
          });
          await get().fetchOpenTickets();
        }
      } catch (error) {
        set({
          errorTickets: error instanceof Error ? error.message : 'Erro ao criar ticket',
          isLoadingTickets: false,
        });
      }
    },

    updateTicket: async (id, updates) => {
      set({ isLoadingTickets: true, errorTickets: null });
      try {
        const updated = await csService.updateSupportTicket(id, updates);
        if (updated) {
          const tickets = get().tickets.map((t) => (t.id === id ? updated : t));
          set({
            tickets,
            isLoadingTickets: false,
          });
          await get().fetchAvgResolutionTime();
        }
      } catch (error) {
        set({
          errorTickets: error instanceof Error ? error.message : 'Erro ao atualizar ticket',
          isLoadingTickets: false,
        });
      }
    },

    resolveTicket: async (id) => {
      try {
        const updated = await csService.resolveTicket(id);
        if (updated) {
          const tickets = get().tickets.map((t) => (t.id === id ? updated : t));
          set({ tickets });
          await get().fetchAvgResolutionTime();
        }
      } catch (error) {
        console.error('Erro ao resolver ticket:', error);
      }
    },

    addTicket: (ticket) => {
      set({ tickets: [...get().tickets, ticket] });
    },

    updateTicketInStore: (id, updates) => {
      const tickets = get().tickets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      set({ tickets });
    },

    // ========== SUBSCRIBE ==========

    subscribeToCustomers: () => {
      csService.subscribeToCustomers({
        onInsert: (customer) => get().addCustomer(customer),
        onUpdate: (customer) => get().updateCustomerInStore(customer.id, customer),
        onDelete: (customer) => {
          const customers = get().customers.filter((c) => c.id !== customer.id);
          set({ customers });
        },
      });
    },

    subscribeToTickets: () => {
      csService.subscribeToTickets({
        onInsert: (ticket) => get().addTicket(ticket),
        onUpdate: (ticket) => get().updateTicketInStore(ticket.id, ticket),
        onDelete: (ticket) => {
          const tickets = get().tickets.filter((t) => t.id !== ticket.id);
          set({ tickets });
        },
      });
    },
  }))
);
