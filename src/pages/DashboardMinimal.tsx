import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { colorSystemEnterprise } from '@/styles/color-system-enterprise';
import { ChartTooltip } from '@/components/ChartTooltip';
import { useMRRData, useChurnData, useFunnelData, useCustomerMetrics } from '@/hooks/useMetricsQueries';


export default function DashboardMinimal() {
  // Hooks para dados reais do Supabase
  const { data: dadosMRR, loading: loadingMRR, error: errorMRR } = useMRRData();
  const { data: dadosChurn, loading: loadingChurn, error: errorChurn } = useChurnData();
  const { loading: loadingFunil, error: errorFunil } = useFunnelData();
  const { error: errorMetrics } = useCustomerMetrics();


  // Show error state
  if (errorMRR || errorChurn || errorFunil || errorMetrics) {
    return (
      <div style={{
        padding: '16px',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          color: '#FF6B6B',
          fontSize: '14px',
          background: 'rgba(255, 107, 107, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 107, 107, 0.2)'
        }}>
          Erro ao carregar métricas: {errorMRR || errorChurn || errorFunil || errorMetrics}
        </div>
      </div>
    );
  }

  // Show loading state
  if (loadingMRR || loadingChurn || loadingFunil) {
    return (
      <div style={{
        padding: '16px',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#A1A1A6', fontSize: '14px' }}>
          ⏳ Carregando métricas do Supabase...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F5F5F7', margin: 0 }}>
          Painel de Controle SaaS
        </h1>
        <p style={{ fontSize: '12px', color: '#A1A1A6', margin: '8px 0 0 0' }}>
          Métricas em tempo real do Supabase
        </p>
      </div>

      {/* SaaS Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* MRR/ARR */}
        <div style={{
          background: 'rgba(11, 14, 25, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#EBEBF0', margin: '0 0 12px 0' }}>
            MRR & ARR
          </h3>
          {dadosMRR.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={dadosMRR}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="mes" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="mrr" fill={colorSystemEnterprise.primary.strongest} />
                <Line dataKey="arr" stroke={colorSystemEnterprise.semantic.success} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1A1A6' }}>
              Sem dados
            </div>
          )}
        </div>

        {/* Churn & NRR */}
        <div style={{
          background: 'rgba(11, 14, 25, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#EBEBF0', margin: '0 0 12px 0' }}>
            Churn vs. NRR
          </h3>
          {dadosChurn.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={dadosChurn}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="mes" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line dataKey="churn_rate" stroke={colorSystemEnterprise.semantic.error} strokeWidth={2} />
                <Line dataKey="nrr" stroke={colorSystemEnterprise.semantic.success} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1A1A6' }}>
              Sem dados
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#A1A1A6', fontSize: '12px', marginTop: '32px' }}>
        <p>Dashboard conectado ao Supabase. Adicione dados nas tabelas para ver os gráficos. ✓</p>
      </div>
    </div>
  );
}
