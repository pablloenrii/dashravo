/**
 * RAVO OS — Customer Success Page (Premium Design)
 * Suporte ao Cliente — Gestão de Tickets e Satisfação
 */

import { useEffect, useState } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button } from '@/components/ui';
import { LoadingSpinner, ErrorState } from '@/components/state';
import { useCSStore } from '../store';

export default function CSPage() {
  const { tickets, isLoading, error, fetchTickets } = useCSStore();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const priorityConfig: Record<string, { gradient: string; badge: string; icon: string }> = {
    low: { gradient: 'from-blue-500 to-blue-600', badge: 'bg-blue-100 text-blue-700', icon: '📍' },
    medium: { gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-100 text-amber-700', icon: '⚠️' },
    high: { gradient: 'from-red-500 to-red-600', badge: 'bg-red-100 text-red-700', icon: '🔥' },
  };

  const statusConfig: Record<string, { gradient: string; badge: string; label: string; icon: string }> = {
    open: { gradient: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 text-purple-700', label: 'Aberto', icon: '📂' },
    in_progress: { gradient: 'from-blue-500 to-indigo-600', badge: 'bg-blue-100 text-blue-700', label: 'Em Progresso', icon: '⚙️' },
    resolved: { gradient: 'from-green-500 to-emerald-600', badge: 'bg-green-100 text-green-700', label: 'Resolvido', icon: '✅' },
    closed: { gradient: 'from-gray-500 to-gray-600', badge: 'bg-gray-100 text-gray-700', label: 'Fechado', icon: '📋' },
  };

  const filteredTickets = filterStatus
    ? tickets.filter(ticket => ticket.status === filterStatus)
    : tickets;

  const ticketsByStatus = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  const resolutionRate = tickets.length > 0
    ? Math.round(((tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length) / tickets.length) * 100)
    : 0;

  const highPriorityCount = tickets.filter(t => t.priority === 'high').length;

  return (
    <Layout>
      <Header
        title="Customer Success"
        subtitle="Gerencie tickets de suporte e satisfação dos clientes"
        actions={
          <button className="btn-primary">
            + Novo Ticket
          </button>
        }
      />

      <div className="main-content space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tickets Abertos</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{ticketsByStatus.open}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">📂</div>
            </div>
            <div className="text-xs text-gray-500">Requerem atenção</div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Em Progresso</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{ticketsByStatus.in_progress}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">⚙️</div>
            </div>
            <div className="text-xs text-gray-500">Sendo resolvidos</div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Resolvidos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{ticketsByStatus.resolved}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">✅</div>
            </div>
            <div className="text-xs text-gray-500">Satisfação garantida</div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Taxa de Resolução</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{resolutionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-xl">📊</div>
            </div>
            <div className="text-xs text-gray-500">Do total resolvido</div>
          </div>
        </div>

        {/* Alert Section */}
        {highPriorityCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <div className="text-2xl">🔥</div>
            <div className="flex-1">
              <p className="font-semibold text-red-900">{highPriorityCount} ticket(s) de alta prioridade</p>
              <p className="text-sm text-red-700">Requerem atenção imediata</p>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilterStatus(null)}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all text-sm ${
              filterStatus === null
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos <span className="ml-2 opacity-70">({tickets.length})</span>
          </button>

          {(Object.entries(statusConfig) as any[]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                filterStatus === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.icon} {config.label} <span className="ml-2 opacity-70">({ticketsByStatus[key as keyof typeof ticketsByStatus]})</span>
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <ErrorState
            title="Erro ao carregar tickets"
            message={error}
            action={<Button onClick={fetchTickets}>Tentar novamente</Button>}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="card-premium p-12 text-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTickets.length === 0 && (
          <div className="card-premium p-12 text-center">
            <div className="text-5xl mb-4">🎫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterStatus ? `Sem tickets "${statusConfig[filterStatus as keyof typeof statusConfig]?.label.toLowerCase()}"` : 'Sem tickets'}
            </h3>
            <p className="text-gray-600 mb-6">Crie seu primeiro ticket de suporte</p>
            <button className="btn-primary">+ Novo Ticket</button>
          </div>
        )}

        {/* Tickets List */}
        {!isLoading && filteredTickets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {filterStatus
                ? `${filteredTickets.length} ${statusConfig[filterStatus as keyof typeof statusConfig]?.label.toLowerCase()}`
                : `Todos os Tickets (${filteredTickets.length})`
              }
            </h3>

            <div className="grid gap-4">
              {filteredTickets.map((ticket) => {
                const statusCfg = statusConfig[ticket.status as keyof typeof statusConfig];
                const priorityCfg = priorityConfig[ticket.priority];

                return (
                  <div key={ticket.id} className="card-premium overflow-hidden group cursor-pointer">
                    <div className={`h-1 bg-gradient-to-r ${statusCfg.gradient}`} />

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">{statusCfg.icon}</span>
                            <h3 className="font-bold text-gray-900">{ticket.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 ml-8 line-clamp-2">{ticket.description}</p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${priorityCfg?.badge}`}>
                            {priorityCfg?.icon} {ticket.priority}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.badge}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
                        <span>ID: {ticket.id.substring(0, 8)}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
