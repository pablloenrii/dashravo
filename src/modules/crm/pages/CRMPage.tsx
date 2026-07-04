/**
 * RAVO OS — CRM Page
 * Página principal do módulo CRM
 */

import { useEffect } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/state';
import { useCRMStore } from '../store';
import LeadsList from '../components/LeadsList';

export default function CRMPage() {
  const { leads, isLoading, error, fetchLeads } = useCRMStore();

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <Layout>
      <Header
        title="CRM"
        subtitle="Gerenciar leads e clientes"
        actions={
          <Button variant="primary">
            + Novo Lead
          </Button>
        }
      />

      <div className="p-6">
        {error && (
          <ErrorState
            title="Erro ao carregar"
            message={error}
            action={<Button onClick={fetchLeads}>Tentar novamente</Button>}
          />
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && leads.length === 0 && (
          <EmptyState
            title="Sem leads ainda"
            message="Crie seu primeiro lead para começar"
            action={<Button variant="primary">+ Novo Lead</Button>}
          />
        )}

        {!isLoading && leads.length > 0 && (
          <Card>
            <LeadsList leads={leads} />
          </Card>
        )}
      </div>
    </Layout>
  );
}
