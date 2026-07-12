/**
 * RAVO OS — Mock data (APENAS desenvolvimento)
 *
 * Usado exclusivamente quando VITE_USE_MOCK=true no .env.local.
 * Não há mais fallback automático: erro de rede/banco aparece na UI.
 * (v6: remover este arquivo do bundle de produção via code-splitting)
 */

export const MOCK_CONTATOS = [
  { id: '1', nome: 'João Silva', empresa: 'Acme Corp', email: 'joao@example.com', telefone: '11 98765-4321', etapa: 'Qualificado', valor: 45000, created_at: '2026-07-10' },
  { id: '2', nome: 'Maria Santos', empresa: 'TechStart', email: 'maria@example.com', telefone: '21 99876-5432', etapa: 'Proposta', valor: 28000, created_at: '2026-07-09' },
  { id: '3', nome: 'Pedro Costa', empresa: 'WebFlow', email: 'pedro@example.com', telefone: '85 98765-1234', etapa: 'Contatado', valor: 12000, created_at: '2026-07-08' },
  { id: '4', nome: 'Ana Oliveira', empresa: 'CloudSys', email: 'ana@example.com', telefone: '31 97654-3210', etapa: 'Qualificado', valor: 56000, created_at: '2026-07-07' },
];

export const MOCK_CONTACTS_CHART = [
  { mes: 'Fev', novos: 8, ativos: 23 },
  { mes: 'Mar', novos: 12, ativos: 35 },
  { mes: 'Abr', novos: 10, ativos: 45 },
  { mes: 'Mai', novos: 15, ativos: 60 },
  { mes: 'Jun', novos: 18, ativos: 78 },
  { mes: 'Jul', novos: 21, ativos: 92 },
];

export const MOCK_OPPORTUNITIES = [
  { name: 'Qualificado', quantidade: 320, fill: '#3B82F6' },
  { name: 'Proposta', quantidade: 280, fill: '#10B981' },
  { name: 'Negociação', quantidade: 190, fill: '#F59E0B' },
  { name: 'Fechado', quantidade: 105, fill: '#6B7280' },
];

export const MOCK_FINANCE_CHART = [
  { mes: 'Fev', receita: 125000, despesa: 85000, lucro: 40000 },
  { mes: 'Mar', receita: 118000, despesa: 82000, lucro: 36000 },
  { mes: 'Abr', receita: 145000, despesa: 88000, lucro: 57000 },
  { mes: 'Mai', receita: 168000, despesa: 92000, lucro: 76000 },
  { mes: 'Jun', receita: 185000, despesa: 95000, lucro: 90000 },
  { mes: 'Jul', receita: 215000, despesa: 98000, lucro: 117000 },
];

export const MOCK_CASH_FLOW = [
  { semana: '15 Jun', entradas: 45000, saidas: 28000 },
  { semana: '22 Jun', entradas: 52000, saidas: 31000 },
  { semana: '29 Jun', entradas: 38000, saidas: 24000 },
  { semana: '06 Jul', entradas: 61000, saidas: 35000 },
];

export const MOCK_EXPENSES = [
  { name: 'Pessoal', value: 45000, percentual: 42, fill: '#3B82F6' },
  { name: 'Infraestrutura', value: 25000, percentual: 24, fill: '#10B981' },
  { name: 'Marketing', value: 18000, percentual: 17, fill: '#F59E0B' },
  { name: 'Outros', value: 12000, percentual: 12, fill: '#6B7280' },
];

export const MOCK_GOAL_PROGRESS = [
  { semana: '15 Jun', atingido: 15, meta: 25 },
  { semana: '22 Jun', atingido: 28, meta: 25 },
  { semana: '29 Jun', atingido: 31, meta: 25 },
  { semana: '06 Jul', atingido: 38, meta: 25 },
];

export const MOCK_GOALS = [
  { id: '1', nome: 'Faturamento Q2', meta: 500000, realizado: 485000, status: 'no-prazo', percentual: 97, periodo: 'Q2' },
  { id: '2', nome: 'Novos Clientes', meta: 50, realizado: 48, status: 'no-prazo', percentual: 96, periodo: 'Mensal' },
  { id: '3', nome: 'Taxa de Retenção', meta: 95, realizado: 92, status: 'no-prazo', percentual: 97, periodo: 'Mensal' },
  { id: '4', nome: 'NPS Score', meta: 80, realizado: 75, status: 'atencao', percentual: 94, periodo: 'Trimestral' },
];

export const MOCK_TICKETS = [
  { id: '1', cliente: 'Acme Corp', assunto: 'Erro na integração', prioridade: 'alta', status: 'aberto', tempo_resposta: '2h 15m' },
  { id: '2', cliente: 'TechStart', assunto: 'Fatura em duplicata', prioridade: 'média', status: 'aberto', tempo_resposta: '1h 30m' },
  { id: '3', cliente: 'DataCore', assunto: 'Upgrade de plano', prioridade: 'média', status: 'aberto', tempo_resposta: '3h 20m' },
];

export const MOCK_ATTENDANCE = [
  { dia: 'Segunda', recebidos: 45, resolvidos: 38, pendentes: 7 },
  { dia: 'Terça', recebidos: 52, resolvidos: 48, pendentes: 4 },
  { dia: 'Quarta', recebidos: 38, resolvidos: 35, pendentes: 3 },
  { dia: 'Quinta', recebidos: 61, resolvidos: 58, pendentes: 3 },
  { dia: 'Sexta', recebidos: 42, resolvidos: 40, pendentes: 2 },
];

export const MOCK_SATISFACTION = [
  { semana: '15 Jun', nps: 68, satisfacao: 85 },
  { semana: '22 Jun', nps: 72, satisfacao: 87 },
  { semana: '29 Jun', nps: 75, satisfacao: 89 },
  { semana: '06 Jul', nps: 78, satisfacao: 91 },
];

export const MOCK_MRR = [
  { mes: 'Fev', mrr: 42500, arr: 510000 },
  { mes: 'Mar', mrr: 45000, arr: 540000 },
  { mes: 'Abr', mrr: 52000, arr: 624000 },
  { mes: 'Mai', mrr: 58000, arr: 696000 },
  { mes: 'Jun', mrr: 62000, arr: 744000 },
  { mes: 'Jul', mrr: 72000, arr: 864000 },
];

export const MOCK_CHURN = [
  { mes: 'Fev', churn_rate: 3.2, nrr: 104 },
  { mes: 'Mar', churn_rate: 2.8, nrr: 106 },
  { mes: 'Abr', churn_rate: 2.4, nrr: 108 },
  { mes: 'Mai', churn_rate: 2.1, nrr: 110 },
  { mes: 'Jun', churn_rate: 1.9, nrr: 111 },
  { mes: 'Jul', churn_rate: 1.5, nrr: 112 },
];

export const MOCK_FUNNEL = [
  { estagio: 'Identificado', quantidade: 1000, conversao: 100 },
  { estagio: 'Contatado', quantidade: 650, conversao: 65 },
  { estagio: 'Qualificado', quantidade: 380, conversao: 38 },
  { estagio: 'Proposta', quantidade: 245, conversao: 24.5 },
  { estagio: 'Fechado', quantidade: 180, conversao: 18 },
];

export const MOCK_CUSTOMER_METRICS: Record<string, number> = {
  CAC: 1200,
  LTV: 25200,
  'Active Customers': 245,
  'MRR Total': 72000,
};
