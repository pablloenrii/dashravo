import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { KPICardMinimal } from '@/components/KPICardMinimal';
import { Badge } from '@/components/Badge';
import { ChartTooltip } from '@/components/ChartTooltip';
import { colorSystem } from '@/styles/color-system';

const dadosProgresso = [
  { semana: 'Sem 1', atingido: 15, meta: 25 },
  { semana: 'Sem 2', atingido: 28, meta: 25 },
  { semana: 'Sem 3', atingido: 31, meta: 25 },
  { semana: 'Sem 4', atingido: 38, meta: 25 },
];

const metas = [
  { nome: 'Faturamento Q2', meta: 500000, realizado: 485000, percentual: 97, status: 'no-prazo' },
  { nome: 'Novos Clientes', meta: 50, realizado: 48, percentual: 96, status: 'no-prazo' },
  { nome: 'Taxa de Retenção', meta: 95, realizado: 92, percentual: 97, status: 'no-prazo' },
  { nome: 'NPS Score', meta: 80, realizado: 75, percentual: 94, status: 'atencao' },
  { nome: 'Margem Lucro', meta: 55, realizado: 54, percentual: 98, status: 'no-prazo' },
  { nome: 'Satisfação Cliente', meta: 90, realizado: 87, percentual: 97, status: 'no-prazo' },
];

export function GoalsPage() {
  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F5F5F7', margin: 0 }}>
              Metas e Objetivos
            </h1>
            <Badge variant="success">PROGRESS</Badge>
          </div>
          <p style={{ fontSize: '12px', color: '#A1A1A6', margin: 0 }}>
            Acompanhamento de KPIs e metas estratégicas
          </p>
        </div>
        <div style={{ fontSize: '32px', opacity: 0.1 }}>🎯</div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        <KPICardMinimal title="Progresso Geral" value="97%" unit="do trimestre" icon={<CheckCircle />} color={colorSystem.success} trend={{ direction: 'up', percentage: 5 }} />
        <KPICardMinimal title="Metas Atingidas" value="5 de 6" unit="cumpridas" icon={<Target />} color={colorSystem.conversion.primary} trend={{ direction: 'up', percentage: 2 }} />
        <KPICardMinimal title="Em Atenção" value="1" unit="meta" icon={<AlertCircle />} color={colorSystem.automation.primary} trend={{ direction: 'down', percentage: 3 }} />
        <KPICardMinimal title="Projeção Final" value="R$ 515K" unit="estimado" icon={<TrendingUp />} color={colorSystem.revenue.primary} trend={{ direction: 'up', percentage: 8 }} />
      </div>

      {/* Gráfico Principal */}
      <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Progresso Semanal vs Meta</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dadosProgresso}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="semana" stroke="#86868B" style={{ fontSize: '11px' }} />
            <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="atingido" fill={colorSystem.success} radius={[4, 4, 0, 0]} />
            <Bar dataKey="meta" fill={colorSystem.pipeline.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metas Detalhadas */}
      <div style={{ background: 'rgba(11, 14, 25, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 12px 0' }}>Metas Estratégicas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          {metas.map((meta, idx) => (
            <div key={idx} style={{ padding: '12px', background: '#11152B', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#F5F5F7' }}>{meta.nome}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: meta.status === 'no-prazo' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                    color: meta.status === 'no-prazo' ? colorSystem.success : colorSystem.automation.primary,
                  }}
                >
                  {meta.status === 'no-prazo' ? 'No Prazo' : 'Atenção'}
                </span>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#A1A1A6', marginBottom: '4px' }}>
                  <span>Realizado: {meta.realizado}</span>
                  <span>Meta: {meta.meta}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${meta.percentual}%`,
                      height: '100%',
                      background: meta.status === 'no-prazo' ? colorSystem.success : colorSystem.automation.primary,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              <span style={{ fontSize: '11px', fontWeight: '600', color: '#F5F5F7' }}>{meta.percentual}% atingido</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GoalsPage;
