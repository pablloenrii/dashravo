/**
 * RAVO OS — Customer Success Page
 */

import { useEffect } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/state';
import { useCSStore } from '../store';

export default function CSPage() {
  const { tickets, isLoading, error, fetchTickets } = useCSStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    open: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <Layout>
      <Header
        title="Customer Success"
        subtitle="Gerenciar clientes e tickets"
        actions={
          <Button variant="primary">
            + Novo Ticket
          </Button>
        }
      />

      <div className="p-6">
        {error && (
          <ErrorState
            title="Erro ao carregar"
            message={error}
            action={<Button onClick={fetchTickets}>Tentar novamente</Button>}
          />
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && tickets.length === 0 && (
          <EmptyState
            title="Sem tickets"
            message="Crie seu primeiro ticket de suporte"
            action={<Button variant="primary">+ Novo Ticket</Button>}
          />
        )}

        {!isLoading && tickets.length > 0 && (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={priorityColors[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={statusColors[ticket.status]}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Criado em: {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
