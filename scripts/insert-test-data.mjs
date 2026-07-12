#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

// Ler .env.local
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

async function deleteAllData() {
  console.log('🗑️  Limpando dados existentes...');
  try {
    await supabase.from('contatos').delete().neq('user_id', '');
    await supabase.from('receitas').delete().neq('user_id', '');
    await supabase.from('fluxo_caixa').delete().neq('user_id', '');
    await supabase.from('despesas').delete().neq('user_id', '');
    await supabase.from('metas').delete().neq('user_id', '');
    await supabase.from('progresso_semanal').delete().neq('user_id', '');
    await supabase.from('tickets').delete().neq('user_id', '');
    await supabase.from('satisfacao').delete().neq('user_id', '');
    console.log('✅ Dados limpos');
  } catch (error) {
    console.error('❌ Erro ao limpar:', error.message);
  }
}

async function insertContatos() {
  console.log('📋 Inserindo contatos...');
  const data = [
    { user_id: TEST_USER_ID, nome: 'João Silva', empresa: 'Acme Corp', email: 'joao@example.com', telefone: '11 98765-4321', etapa: 'Qualificado', valor: 45000 },
    { user_id: TEST_USER_ID, nome: 'Maria Santos', empresa: 'TechStart', email: 'maria@example.com', telefone: '21 99876-5432', etapa: 'Proposta', valor: 28000 },
    { user_id: TEST_USER_ID, nome: 'Pedro Costa', empresa: 'WebFlow', email: 'pedro@example.com', telefone: '85 98765-1234', etapa: 'Contatado', valor: 12000 },
    { user_id: TEST_USER_ID, nome: 'Ana Oliveira', empresa: 'CloudSys', email: 'ana@example.com', telefone: '31 97654-3210', etapa: 'Qualificado', valor: 56000 },
    { user_id: TEST_USER_ID, nome: 'Carlos Mendes', empresa: 'DataCore', email: 'carlos@example.com', telefone: '41 98765-9876', etapa: 'Identificado', valor: 15000 },
    { user_id: TEST_USER_ID, nome: 'Lucia Ferreira', empresa: 'SoftWare Inc', email: 'lucia@example.com', telefone: '51 99876-1234', etapa: 'Qualificado', valor: 72000 },
    { user_id: TEST_USER_ID, nome: 'Marco Rossi', empresa: 'Tech Solutions', email: 'marco@example.com', telefone: '61 98765-5678', etapa: 'Proposta', valor: 38000 },
    { user_id: TEST_USER_ID, nome: 'Beatriz Lima', empresa: 'Web Innovations', email: 'beatriz@example.com', telefone: '71 97654-8765', etapa: 'Fechado', valor: 95000 },
  ];

  const { error } = await supabase.from('contatos').insert(data);
  if (error) console.error('❌', error.message);
  else console.log('✅ 8 contatos inseridos');
}

async function insertReceitas() {
  console.log('💰 Inserindo receitas...');
  const data = [
    { user_id: TEST_USER_ID, mes: '2026-02-01', receita: 125000, despesa: 85000, lucro: 40000 },
    { user_id: TEST_USER_ID, mes: '2026-03-01', receita: 118000, despesa: 82000, lucro: 36000 },
    { user_id: TEST_USER_ID, mes: '2026-04-01', receita: 145000, despesa: 88000, lucro: 57000 },
    { user_id: TEST_USER_ID, mes: '2026-05-01', receita: 168000, despesa: 92000, lucro: 76000 },
    { user_id: TEST_USER_ID, mes: '2026-06-01', receita: 185000, despesa: 95000, lucro: 90000 },
    { user_id: TEST_USER_ID, mes: '2026-07-01', receita: 215000, despesa: 98000, lucro: 117000 },
  ];

  const { error } = await supabase.from('receitas').insert(data);
  if (error) console.error('❌', error.message);
  else console.log('✅ 6 receitas inseridas');
}

async function insertFluxoCaixa() {
  console.log('💳 Inserindo fluxo de caixa...');
  const data = [
    { user_id: TEST_USER_ID, semana: '2026-06-15', entradas: 45000, saidas: 28000 },
    { user_id: TEST_USER_ID, semana: '2026-06-22', entradas: 52000, saidas: 31000 },
    { user_id: TEST_USER_ID, semana: '2026-06-29', entradas: 38000, saidas: 24000 },
    { user_id: TEST_USER_ID, semana: '2026-07-06', entradas: 61000, saidas: 35000 },
  ];

  const { error } = await supabase.from('fluxo_caixa').insert(data);
  if (error) console.error('❌', error.message);
  else console.log('✅ 4 fluxos inseridos');
}

async function insertDespesas() {
  console.log('📊 Inserindo despesas...');
  const data = [
    { user_id: TEST_USER_ID, categoria: 'Pessoal', valor: 45000, mes: '2026-07-01' },
    { user_id: TEST_USER_ID, categoria: 'Infraestrutura', valor: 25000, mes: '2026-07-01' },
    { user_id: TEST_USER_ID, categoria: 'Marketing', valor: 18000, mes: '2026-07-01' },
    { user_id: TEST_USER_ID, categoria: 'Outros', valor: 12000, mes: '2026-07-01' },
  ];

  const { error } = await supabase.from('despesas').insert(data);
  if (error) console.error('❌', error.message);
  else console.log('✅ 4 despesas inseridas');
}

async function insertMetas() {
  console.log('🎯 Inserindo metas...');
  const data = [
    { user_id: TEST_USER_ID, nome: 'Faturamento Q2', meta: 500000, realizado: 485000, status: 'no-prazo', periodo: 'Q2' },
    { user_id: TEST_USER_ID, nome: 'Novos Clientes', meta: 50, realizado: 48, status: 'no-prazo', periodo: 'Mensal' },
    { user_id: TEST_USER_ID, nome: 'Taxa de Retenção', meta: 95, realizado: 92, status: 'no-prazo', periodo: 'Mensal' },
    { user_id: TEST_USER_ID, nome: 'NPS Score', meta: 80, realizado: 75, status: 'atencao', periodo: 'Mensal' },
    { user_id: TEST_USER_ID, nome: 'Margem Lucro', meta: 55, realizado: 54, status: 'no-prazo', periodo: 'Mensal' },
    { user_id: TEST_USER_ID, nome: 'Satisfação Cliente', meta: 90, realizado: 87, status: 'no-prazo', periodo: 'Mensal' },
  ];

  const { error } = await supabase.from('metas').insert(data);
  if (error) console.error('❌', error.message);
  else console.log('✅ 6 metas inseridas');
}

async function insertProgresso() {
  console.log('📈 Inserindo progresso semanal...');
  const data = [
    { user_id: TEST_USER_ID, semana: '2026-06-15', atingido: 15, meta: 25 },
    { user_id: TEST_USER_ID, semana: '2026-06-22', atingido: 28, meta: 25 },
    { user_id: TEST_USER_ID, semana: '2026-06-29', atingido: 31, meta: 25 },
    { user_id: TEST_USER_ID, semana: '2026-07-06', atingido: 38, meta: 25 },
  ];

  const { error } = await supabase.from('progresso_semanal').insert(data);
  if (error) console.error('❌', error.message);
  else console.log('✅ 4 progressos inseridos');
}

async function insertTickets() {
  console.log('🎫 Inserindo tickets...');
  const data = [
    { user_id: TEST_USER_ID, ticketId: '#TKT-2451', cliente: 'Acme Corp', assunto: 'Erro na integração', prioridade: 'alta', status: 'aberto', tempo_resposta: '2h 15m' },
    { user_id: TEST_USER_ID, ticketId: '#TKT-2450', cliente: 'TechStart', assunto: 'Fatura em duplicata', prioridade: 'média', status: 'aberto', tempo_resposta: '1h 30m' },
    { user_id: TEST_USER_ID, ticketId: '#TKT-2449', cliente: 'WebFlow', assunto: 'Reset de senha', prioridade: 'baixa', status: 'resolvido', tempo_resposta: '45m' },
    { user_id: TEST_USER_ID, ticketId: '#TKT-2448', cliente: 'CloudSys', assunto: 'Dúvida sobre recurso', prioridade: 'baixa', status: 'resolvido', tempo_resposta: '1h 10m' },
    { user_id: TEST_USER_ID, ticketId: '#TKT-2447', cliente: 'DataCore', assunto: 'Upgrade de plano', prioridade: 'média', status: 'aberto', tempo_resposta: '3h 20m' },
    { user_id: TEST_USER_ID, ticketId: '#TKT-2446', cliente: 'SoftWare Inc', assunto: 'API timeout', prioridade: 'alta', status: 'aberto', tempo_resposta: '1h 45m' },
  ];

  const { error } = await supabase.from('tickets').insert(data);
  if (error) console.error('❌', error.message);
  else console.log('✅ 6 tickets inseridos');
}

async function insertSatisfacao() {
  console.log('⭐ Inserindo satisfação...');
  const data = [
    { user_id: TEST_USER_ID, semana: '2026-06-15', nps: 68, satisfacao: 85 },
    { user_id: TEST_USER_ID, semana: '2026-06-22', nps: 72, satisfacao: 87 },
    { user_id: TEST_USER_ID, semana: '2026-06-29', nps: 75, satisfacao: 89 },
    { user_id: TEST_USER_ID, semana: '2026-07-06', nps: 78, satisfacao: 91 },
  ];

  const { error } = await supabase.from('satisfacao').insert(data);
  if (error) console.error('❌', error.message);
  else console.log('✅ 4 satisfações inseridas');
}

async function main() {
  console.log('🚀 Iniciando inserção de dados de teste...\n');

  await deleteAllData();
  await insertContatos();
  await insertReceitas();
  await insertFluxoCaixa();
  await insertDespesas();
  await insertMetas();
  await insertProgresso();
  await insertTickets();
  await insertSatisfacao();

  console.log('\n✅ Concluído! 42 registros inseridos em 8 tabelas');
}

main().catch(console.error);
