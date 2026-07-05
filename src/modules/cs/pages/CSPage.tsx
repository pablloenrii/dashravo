/**
 * RAVO OS — Customer Success Page
 * Gerenciar clientes e tickets com design moderno
 */

import { useEffect, useState } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/state';
import { useCSStore } from '../store';

export default function CSPage() {
  const { tickets, isLoading, error, fetchTickets } = useCSStore();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const priorityConfig = {
    low: { bg: 'bg-blue-50 border-blue-200 text-blue-700', badge: 'bg-blue-100 text-blue-800', icon: '📍' },
    medium: { bg: 'bg-yellow-50 border-yellow-200 text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
    high: { bg: 'bg-red-50 border-red-200 text-red-700', badge: 'bg-red-100 text-red-800', icon: '🔥' },
  };

  const statusConfig = {
    open: { bg: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-800', label: 'Aberto', icon: '📂' },
    in_progress: { bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800', label: 'Em Progresso', icon: '⚙️' },
    resolved: { bg: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800', label: 'Resolvido', icon: '✅' },
    closed: { bg: 'bg-gray-50 border-gray-200', badge: 'bg-gray-100 text-gray-800', label: 'Fechado', icon: '📋' },
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

  return (
    <Layout>
      <Header
        title="Customer Success"
        subtitle="Gerenciar clientes e tickets de suporte"
        actions={
          <Button variant="primary">
            + Novo Ticket
          </Button>
        }
      />

      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
              <div className="text-sm opacity-90 mb-2">Tickets Abertos</div>
              <div className="text-3xl font-bold">{ticketsByStatus.open}</div>
              <div className="text-xs mt-2 opacity-75">Requerem atenção</div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
              <div className="text-sm opacity-90 mb-2">Em Progresso</div>
              <div className="text-3xl font-bold">{ticketsByStatus.in_progress}</div>
              <div className="text-xs mt-2 opacity-75">Sendo resolvidos</div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
              <div className="text-sm opacity-90 mb-2">Resolvidos</div>
              <div className="text-3xl font-bold">{ticketsByStatus.resolved}</div>
              <div className="text-xs mt-2 opacity-75">Satisfação garantida</div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white">
              <div className="text-sm opacity-90 mb-2">Taxa de Resolução</div>
              <div className="text-3xl font-bold">{resolutionRate}%</div>
              <div className="text-xs mt-2 opacity-75">Do total resolvido</div>
            </div>
          </Card>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterStatus === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterStatus(null)}
          >
            Todos ({tickets.length})
          </Button>
          {(Object.entries(statusConfig) as any[]).map(([key, config]) => (
            <Button
              key={key}
              variant={filterStatus === key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterStatus(key)}
            >
              {config.icon} {config.label} ({ticketsByStatus[key as keyof typeof ticketsByStatus]})
            </Button>
          ))}
        </div>

        {error && (
          <ErrorState
            title="Erro ao carregar"
            message={error}
            action={<Button onClick={fetchTickets}>Tentar novamente</Button>}
          />
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && filteredTickets.length === 0 && (
          <EmptyState
            title={filterStatus ? `Sem tickets ${statusConfig[filterStatus as keyof typeof statusConfig]?.label.toLowerCase()}` : "Sem tickets"}
            message={filterStatus ? 'Nenhum ticket nesta categoria' : "Crie seu primeiro ticket de suporte"}
            action={<Button variant="primary">+ Novo Ticket</Button>}
          />
        )}

        {!isLoading && filteredTickets.length > 0 && (
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => {
              const config = statusConfig[ticket.status as keyof typeof statusConfig];
              const priority = priorityConfig[ticket.priority];

              return (
                <Card key={ticket.id} className={`border-2 overflow-hidden hover:shadow-lg transition-all ${config.bg}`}>
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-lg">{config.icon}</span>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge className={priority?.badge}>
                          {priority?.icon} {ticket.priority}
                        </Badge>
                        <Badge className={config.badge}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>ID: {ticket.id.substring(0, 8)}</span>
                      <span>Criado em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
