/**
 * RAVO OS — CRM Page (Premium Design)
 * Pipeline de vendas — Gerenciamento profissional de leads
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    { value: 'lead', label: 'Novos Leads', icon: '📍', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
    { value: 'qualified', label: 'Qualificados', icon: '✅', color: 'green', gradient: 'from-green-500 to-green-600' },
    { value: 'contacted', label: 'Contatados', icon: '📞', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
    { value: 'converted', label: 'Convertidos', icon: '🎉', color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
    { value: 'lost', label: 'Perdidos', icon: '❌', color: 'red', gradient: 'from-red-500 to-red-600' },
  ];

  const filteredLeads = filterStatus
    ? leads.filter(lead => lead.status === filterStatus)
    : leads;

  const leadsByStatus = statuses.map(status => ({
    ...status,
    count: leads.filter(l => l.status === status.value).length,
  }));

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0
    ? Math.round((leads.filter(l => l.status === 'converted').length / totalLeads) * 100)
    : 0;

  return (
    <Layout>
      <Header
        title="CRM"
        subtitle="Gerencie seu pipeline de vendas e leads"
        actions={
          <button className="btn-primary">
            + Novo Lead
          </button>
        }
      />

      <div className="main-content space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalLeads}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">👥</div>
            </div>
            <div className="text-xs text-gray-500">Neste período</div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{conversionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">📈</div>
            </div>
            <div className="text-xs text-gray-500">Meta: 20%</div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Qualificados</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {leads.filter(l => l.status === 'qualified').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">⭐</div>
            </div>
            <div className="text-xs text-gray-500">Prontos para contato</div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Valor em Pipeline</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">$0.00</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">💰</div>
            </div>
            <div className="text-xs text-gray-500">Oportunidades ativas</div>
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Pipeline por Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div
              className={`card-premium p-6 cursor-pointer transition-all ${
                !filterStatus ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
              }`}
              onClick={() => setFilterStatus(null)}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
                <div className="text-sm text-gray-600 mt-2">Todos os Leads</div>
              </div>
            </div>

            {leadsByStatus.map((status) => (
              <div
                key={status.value}
                className={`card-premium p-6 cursor-pointer transition-all overflow-hidden relative ${
                  filterStatus === status.value ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                }`}
                onClick={() => setFilterStatus(status.value)}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${status.gradient}`} />
                <div className="text-center pt-2">
                  <div className="text-3xl mb-3">{status.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{status.count}</div>
                  <div className="text-sm text-gray-600 mt-2">{status.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads List */}
        {error && (
          <ErrorState
            title="Erro ao carregar leads"
            message={error}
            action={<Button onClick={fetchLeads}>Tentar novamente</Button>}
          />
        )}

        {isLoading && (
          <div className="card-premium p-12 text-center">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && filteredLeads.length === 0 && (
          <div className="card-premium p-12 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterStatus ? `Sem leads em "${statuses.find(s => s.value === filterStatus)?.label}"` : 'Sem leads ainda'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus ? 'Mova leads para esta categoria' : 'Crie seu primeiro lead para começar'}
            </p>
            <button className="btn-primary">+ Novo Lead</button>
          </div>
        )}

        {!isLoading && filteredLeads.length > 0 && (
          <div className="card-premium overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900">
                {filterStatus ? `${filteredLeads.length} ${statuses.find(s => s.value === filterStatus)?.label}` : `Todos os Leads (${filteredLeads.length})`}
              </h3>
            </div>
            <LeadsList leads={filteredLeads} />
          </div>
        )}
      </div>
    </Layout>
  );
}
