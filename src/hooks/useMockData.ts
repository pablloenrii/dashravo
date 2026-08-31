/**
 * RAVO OS — Mock data (APENAS desenvolvimento)
 *
 * Usado exclusivamente quando VITE_USE_MOCK=true no .env.local.
 * Não há mais fallback automático: erro de rede/banco aparece na UI.
 * (v6: remover este arquivo do bundle de produção via code-splitting)
 */

import { chart } from '@/constants/theme';

export const MOCK_CONTATOS = [
  { id: '1', nome: 'João Silva', empresa: 'Acme Corp', email: 'joao@example.com', telefone: '11 98765-4321', etapa: 'Qualificado', valor: 45000, created_at: '2026-07-10' },
  { id: '2', nome: 'Maria Santos', empresa: 'TechStart', email: 'maria@example.com', telefone: '21 99876-5432', etapa: 'Proposta', valor: 28000, created_at: '2026-07-09' },
  { id: '3', nome: 'Pedro Costa', empresa: 'WebFlow', email: 'pedro@example.com', telefone: '85 98765-1234', etapa: 'Contatado', valor: 12000, created_at: '2026-07-08' },
  { id: '4', nome: 'Ana Oliveira', empresa: 'CloudSys', email: 'ana@example.com', telefone: '31 97654-3210', etapa: 'Qualificado', valor: 56000, created_at: '2026-07-07' },
];

export const MOCK_ATIVIDADES = [
  { id: '1', contato_id: '1', tipo: 'nota', descricao: 'Primeiro contato feito por telefone, cliente demonstrou interesse.', data_prevista: null, concluida: true, concluida_em: '2026-07-10', criado_em: '2026-07-10' },
  { id: '2', contato_id: '1', tipo: 'tarefa', descricao: 'Enviar proposta comercial', data_prevista: '2026-07-15', concluida: false, concluida_em: null, criado_em: '2026-07-11' },
  { id: '3', contato_id: '2', tipo: 'reuniao', descricao: 'Reunião de diagnóstico agendada', data_prevista: '2026-07-14', concluida: false, concluida_em: null, criado_em: '2026-07-09' },
];

export const MOCK_FOLLOWUPS = [
  { contato_id: '1', data_prevista: '2026-07-15' },
  { contato_id: '2', data_prevista: '2026-07-14' },
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
  { name: 'Qualificado', quantidade: 320, fill: chart.light },
  { name: 'Proposta', quantidade: 280, fill: chart.success },
  { name: 'Negociação', quantidade: 190, fill: chart.line },
  { name: 'Fechado', quantidade: 105, fill: chart.neutral },
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
  { name: 'Pessoal', value: 45000, percentual: 42, fill: chart.light },
  { name: 'Infraestrutura', value: 25000, percentual: 24, fill: chart.success },
  { name: 'Marketing', value: 18000, percentual: 17, fill: chart.line },
  { name: 'Outros', value: 12000, percentual: 12, fill: chart.neutral },
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

/* ==========================================================================
   Mocks das métricas de software house (rpcs_softwarehouse.sql)
   Permitem navegar o Dashboard novo antes de o schema estar aplicado na VPS.
   ========================================================================== */

export const mockResumoExecutivo = {
  receita: 87640, custo_direto: 31280, margem_bruta: 56360, margem_bruta_pct: 64.3,
  despesas: 7990, resultado: 48370, resultado_pct: 55.2, runway_meses: 23.2,
};

export const mockMixReceita = [
  { tipo: 'retainer' as const, receita: 27800, participacao: 31.7, recorrente: true },
  { tipo: 'projeto'  as const, receita: 42250, participacao: 48.2, recorrente: false },
  { tipo: 'hora'     as const, receita: 15600, participacao: 17.8, recorrente: false },
  { tipo: 'licenca'  as const, receita: 1990,  participacao: 2.3,  recorrente: true },
];

export const mockReceitaMensal = [
  { mes: '2026-03', retainer: 27800, projeto: 0,     hora: 0,     licenca: 1990, total: 29790, recorrente_pct: 100.0 },
  { mes: '2026-04', retainer: 27800, projeto: 20400, hora: 0,     licenca: 1990, total: 50190, recorrente_pct: 59.4 },
  { mes: '2026-05', retainer: 27800, projeto: 9250,  hora: 0,     licenca: 1990, total: 39040, recorrente_pct: 76.3 },
  { mes: '2026-06', retainer: 27800, projeto: 42250, hora: 15600, licenca: 1990, total: 87640, recorrente_pct: 34.0 },
  { mes: '2026-07', retainer: 25000, projeto: 12600, hora: 17550, licenca: 1990, total: 57140, recorrente_pct: 47.2 },
  { mes: '2026-08', retainer: 25000, projeto: 0,     hora: 11700, licenca: 1990, total: 38690, recorrente_pct: 69.8 },
];

export const mockUtilizacao = [
  { pessoa: 'Rafael Souza',    papel: 'Desenvolvedor Full', horas_faturaveis: 148, horas_totais: 162, capacidade: 177.1, utilizacao_pct: 83.6, realized_rate: 198.4 },
  { pessoa: 'Douglas Costa',   papel: 'Gestor de Tráfego',  horas_faturaveis: 132, horas_totais: 148, capacidade: 177.1, utilizacao_pct: 74.5, realized_rate: 176.2 },
  { pessoa: 'Marina Alves',    papel: 'Designer / UX',      horas_faturaveis: 96,  horas_totais: 130, capacidade: 177.1, utilizacao_pct: 54.2, realized_rate: 162.0 },
  { pessoa: 'Pablo Henrique',  papel: 'Sócio / Estratégia', horas_faturaveis: 38,  horas_totais: 128, capacidade: 132.9, utilizacao_pct: 28.6, realized_rate: 310.5 },
  { pessoa: 'Lynnda Ferreira', papel: 'SDR',                horas_faturaveis: 0,   horas_totais: 152, capacidade: 177.1, utilizacao_pct: 0,    realized_rate: 0 },
];

export const mockMargemProjetos = [
  { projeto: 'Ponto Multi-obra — MVP',       cliente: 'Terra Azul Construções',  tipo: 'projeto' as const, status: 'em_andamento', receita: 40800, custo: 41687, margem: -887,  margem_pct: -2.2, horas_estimadas: 420, horas_reais: 593, desvio_escopo_pct: 41.2 },
  { projeto: 'Portal do Paciente — Fase 1',  cliente: 'Hospital Reviva',         tipo: 'projeto' as const, status: 'em_andamento', receita: 25200, custo: 19125, margem: 6075,  margem_pct: 24.1, horas_estimadas: 260, horas_reais: 255, desvio_escopo_pct: -1.9 },
  { projeto: 'Squad Terra Azul',             cliente: 'Terra Azul Construções',  tipo: 'hora'    as const, status: 'em_andamento', receita: 44850, custo: 13800, margem: 31050, margem_pct: 69.2, horas_estimadas: 160, horas_reais: 184, desvio_escopo_pct: 15.0 },
  { projeto: 'Identidade Visual + 3 LPs',    cliente: 'Leonardo Peruci Imóveis', tipo: 'projeto' as const, status: 'entregue',     receita: 18500, custo: 7420,  margem: 11080, margem_pct: 59.9, horas_estimadas: 120, horas_reais: 112, desvio_escopo_pct: -6.7 },
];

export const mockConcentracao = [
  { cliente: 'Terra Azul Construções',    receita: 33300, participacao: 38.0, acumulado: 38.0 },
  { cliente: 'Hospital Reviva',           receita: 24600, participacao: 28.1, acumulado: 66.1 },
  { cliente: 'Thiago Carvalho Advocacia', receita: 10490, participacao: 12.0, acumulado: 78.1 },
  { cliente: 'Leonardo Peruci Imóveis',   receita: 9250,  participacao: 10.6, acumulado: 88.7 },
  { cliente: 'Vilela Turismo',            receita: 4500,  participacao: 5.1,  acumulado: 93.8 },
];

export const mockBacklog = {
  backlog_projetos: 44000, backlog_recorrente: 239880, backlog_total: 283880,
  receita_media_3m: 55627.5, cobertura_meses: 5.1,
};

export const mockPipeline = [
  { estagio: 'diagnostico',  quantidade: 1, valor_total: 95000, valor_ponderado: 23750 },
  { estagio: 'negociacao',   quantidade: 2, valor_total: 11490, valor_ponderado: 8242 },
  { estagio: 'qualificacao', quantidade: 1, valor_total: 42000, valor_ponderado: 6300 },
  { estagio: 'proposta',     quantidade: 1, valor_total: 6800,  valor_ponderado: 3060 },
];

export const mockSaudeComercial = {
  win_rate: 50.0, ciclo_dias: 35, ticket_medio: 40000, ganhos: 2, perdidos: 2,
};

export const mockCarteiraRecorrente = [
  { mes: '2026-03', mrr: 29790, clientes: 4, churn_pct: 0,    nrr_pct: 100.0 },
  { mes: '2026-04', mrr: 29790, clientes: 4, churn_pct: 0,    nrr_pct: 100.0 },
  { mes: '2026-05', mrr: 29790, clientes: 4, churn_pct: 0,    nrr_pct: 100.0 },
  { mes: '2026-06', mrr: 29790, clientes: 4, churn_pct: 0,    nrr_pct: 100.0 },
  { mes: '2026-07', mrr: 26990, clientes: 3, churn_pct: 25.0, nrr_pct: 90.6 },
  { mes: '2026-08', mrr: 26990, clientes: 3, churn_pct: 0,    nrr_pct: 100.0 },
];
