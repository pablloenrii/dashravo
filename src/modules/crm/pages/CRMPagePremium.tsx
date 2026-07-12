/**
 * RAVO OS — CRM Page (Premium)
 * Professional sales pipeline management
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Skeleton, SkeletonTable } from '@/components/Skeleton';
import { EmptyState } from '@/components/States';
import { DataGrid } from '@/components/DataGrid';

const CRMPagePremium = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading] = useState(false);

  // Data from Supabase (will be integrated)
  const leads = [];
  const stats = [];
  const columns = [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <Skeleton height="sm" className="w-1/3 mb-4" />
              <Skeleton height="lg" className="mb-2" />
              <Skeleton height="sm" className="w-1/2" />
            </div>
          ))}
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <div className="flex-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pipeline de Vendas</h1>
          <p className="text-var(--text-secondary)">Gerencie leads e acompanhe oportunidades</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Novo Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4">
        {stats.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex-between mb-4">
              <p className="text-label">{stat.title}</p>
              <div className="w-10 h-10 rounded-lg bg-var(--bg-secondary) flex-center">
                <stat.icon className="w-5 h-5 text-var(--text-secondary)" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              {stat.trend && (
                <span className={`text-xs font-semibold ${
                  stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend.direction === 'up' ? '↑' : '↓'} {stat.trend.percentage}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DataGrid */}
      {leads.length === 0 ? (
        <EmptyState
          title="Nenhum lead ainda"
          description="Crie seu primeiro lead para começar a gerenciar seu pipeline"
          action={
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Novo Lead
            </button>
          }
        />
      ) : (
        <div className="card p-6">
          <div className="mb-6">
            <h3 className="font-bold flex-between">
              <span>Leads em Pipeline</span>
              <span className="text-sm font-normal text-var(--text-secondary)">{leads.length} total</span>
            </h3>
          </div>
          <DataGrid columns={columns} data={leads} />
        </div>
      )}

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Lead"
        size="md"
        footer={
          <>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button className="btn btn-primary">
              Criar Lead
            </button>
          </>
        }
      >
        <form className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-label mb-2 block">Nome Completo</label>
            <input
              type="text"
              placeholder="João Silva"
              className="w-full px-4 py-2.5 bg-var(--bg-secondary) border border-var(--border-primary) rounded-lg focus:border-var(--primary) focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950/30 transition-all"
            />
          </div>

          {/* Company */}
          <div>
            <label className="text-label mb-2 block">Empresa</label>
            <input
              type="text"
              placeholder="TechCorp"
              className="w-full px-4 py-2.5 bg-var(--bg-secondary) border border-var(--border-primary) rounded-lg focus:border-var(--primary) focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950/30 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-label mb-2 block">Email</label>
            <input
              type="email"
              placeholder="joao@techcorp.com"
              className="w-full px-4 py-2.5 bg-var(--bg-secondary) border border-var(--border-primary) rounded-lg focus:border-var(--primary) focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950/30 transition-all"
            />
          </div>

          {/* Value */}
          <div>
            <label className="text-label mb-2 block">Valor do Deal</label>
            <input
              type="number"
              placeholder="15000"
              className="w-full px-4 py-2.5 bg-var(--bg-secondary) border border-var(--border-primary) rounded-lg focus:border-var(--primary) focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950/30 transition-all"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CRMPagePremium;
