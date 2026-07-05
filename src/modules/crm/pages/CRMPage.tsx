/**
 * RAVO OS — CRM Page
 * Gerenciar leads com design moderno
 */

import { useEffect, useState } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/state';
import { useCRMStore } from '../store';
import LeadsList from '../components/LeadsList';

export default function CRMPage() {
  const { leads, isLoading, error, fetchLeads } = useCRMStore();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const statuses = [
    { value: 'lead', label: 'Leads', icon: '📍', color: 'bg-blue-50 border-blue-200' },
    { value: 'qualified', label: 'Qualificados', icon: '✅', color: 'bg-green-50 border-green-200' },
    { value: 'contacted', label: 'Contatados', icon: '📞', color: 'bg-purple-50 border-purple-200' },
    { value: 'converted', label: 'Convertidos', icon: '🎉', color: 'bg-emerald-50 border-emerald-200' },
    { value: 'lost', label: 'Perdidos', icon: '❌', color: 'bg-red-50 border-red-200' },
  ];

  const filteredLeads = filterStatus
    ? leads.filter(lead => lead.status === filterStatus)
    : leads;

  const leadsByStatus = statuses.map(status => ({
    ...status,
    count: leads.filter(l => l.status === status.value).length,
  }));

  return (
    <Layout>
      <Header
        title="CRM"
        subtitle="Gerenciar leads e pipeline de vendas"
        actions={
          <Button variant="primary">
            + Novo Lead
          </Button>
        }
      />

      <div className="p-6 space-y-8">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card
            className={`p-4 cursor-pointer border-2 transition-all ${
              !filterStatus ? 'border-blue-400 bg-blue-50' : 'border-slate-200'
            }`}
            onClick={() => setFilterStatus(null)}
          >
            <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
            <div className="text-xs text-gray-600 mt-1">Todos os Leads</div>
          </Card>

          {leadsByStatus.map((status) => (
            <Card
              key={status.value}
              className={`p-4 cursor-pointer border-2 transition-all hover:shadow-md ${
                filterStatus === status.value ? `border-blue-400 ${status.color}` : 'border-slate-200'
              }`}
              onClick={() => setFilterStatus(status.value)}
            >
              <div className="text-xl mb-2">{status.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{status.count}</div>
              <div className="text-xs text-gray-600 mt-1">{status.label}</div>
            </Card>
          ))}
        </div>

        {/* Content */}
        {error && (
          <ErrorState
            title="Erro ao carregar"
            message={error}
            action={<Button onClick={fetchLeads}>Tentar novamente</Button>}
          />
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && filteredLeads.length === 0 && (
          <EmptyState
            title={filterStatus ? `Sem leads ${statuses.find(s => s.value === filterStatus)?.label.toLowerCase()}` : "Sem leads ainda"}
            message={filterStatus ? 'Adicione leads nesta categoria' : "Crie seu primeiro lead para começar"}
            action={<Button variant="primary">+ Novo Lead</Button>}
          />
        )}

        {!isLoading && filteredLeads.length > 0 && (
          <Card>
            <LeadsList leads={filteredLeads} />
          </Card>
        )}
      </div>
    </Layout>
  );
}
