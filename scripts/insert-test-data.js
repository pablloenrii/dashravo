#!/usr/bin/env node

/**
 * Script para inserir dados de teste no Supabase
 * Obtém automaticamente o user_id do usuário autenticado
 *
 * Uso: node scripts/insert-test-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados');
  console.error('Verifique seu arquivo .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function insertTestData() {
  try {
    console.log('📋 Obtendo dados do usuário...\n');

    // Obter primeiro usuário (para desenvolvimento)
    const { data: users, error: usersError } = await supabase
      .from('contatos')
      .select('user_id')
      .limit(1);

    let userId;

    if (users && users.length > 0) {
      userId = users[0].user_id;
      console.log(`✓ Usuário encontrado: ${userId}\n`);
    } else {
      // Se não houver dados, tentar obter de auth.users via RPC
      const { data: authData, error: authError } = await supabase
        .rpc('get_current_user_id', {});

      if (authData) {
        userId = authData;
      } else {
        // Fallback: gerar UUID temporário para testes
        userId = 'a0000000-0000-0000-0000-000000000001';
        console.log(`⚠️  Usando UUID temporário para testes: ${userId}\n`);
      }
    }

    console.log('📊 Inserindo dados de teste...\n');

    // 1. CONTATOS
    console.log('1️⃣  Inserindo contatos...');
    const { error: contatosError } = await supabase.from('contatos').insert([
      { user_id: userId, nome: 'João Silva', empresa: 'Acme Corp', email: 'joao@example.com', telefone: '11 98765-4321', etapa: 'Qualificado', valor: 45000 },
      { user_id: userId, nome: 'Maria Santos', empresa: 'TechStart', email: 'maria@example.com', telefone: '21 99876-5432', etapa: 'Proposta', valor: 28000 },
      { user_id: userId, nome: 'Pedro Costa', empresa: 'WebFlow', email: 'pedro@example.com', telefone: '85 98765-1234', etapa: 'Contatado', valor: 12000 },
      { user_id: userId, nome: 'Ana Oliveira', empresa: 'CloudSys', email: 'ana@example.com', telefone: '31 97654-3210', etapa: 'Qualificado', valor: 56000 },
      { user_id: userId, nome: 'Carlos Mendes', empresa: 'DataCore', email: 'carlos@example.com', telefone: '41 98765-9876', etapa: 'Identificado', valor: 15000 },
      { user_id: userId, nome: 'Lucia Ferreira', empresa: 'SoftWare Inc', email: 'lucia@example.com', telefone: '51 99876-1234', etapa: 'Qualificado', valor: 72000 },
      { user_id: userId, nome: 'Marco Rossi', empresa: 'Tech Solutions', email: 'marco@example.com', telefone: '61 98765-5678', etapa: 'Proposta', valor: 38000 },
      { user_id: userId, nome: 'Beatriz Lima', empresa: 'Web Innovations', email: 'beatriz@example.com', telefone: '71 97654-8765', etapa: 'Fechado', valor: 95000 },
    ]);
    if (contatosError) throw contatosError;
    console.log('   ✓ 8 contatos inseridos\n');

    // 2. RECEITAS
    console.log('2️⃣  Inserindo receitas...');
    const { error: receitasError } = await supabase.from('receitas').insert([
      { user_id: userId, mes: '2026-02-01', receita: 125000, despesa: 85000, lucro: 40000 },
      { user_id: userId, mes: '2026-03-01', receita: 118000, despesa: 82000, lucro: 36000 },
      { user_id: userId, mes: '2026-04-01', receita: 145000, despesa: 88000, lucro: 57000 },
      { user_id: userId, mes: '2026-05-01', receita: 168000, despesa: 92000, lucro: 76000 },
      { user_id: userId, mes: '2026-06-01', receita: 185000, despesa: 95000, lucro: 90000 },
      { user_id: userId, mes: '2026-07-01', receita: 215000, despesa: 98000, lucro: 117000 },
    ]);
    if (receitasError) throw receitasError;
    console.log('   ✓ 6 receitas inseridas\n');

    // 3. FLUXO DE CAIXA
    console.log('3️⃣  Inserindo fluxo de caixa...');
    const { error: fluxoError } = await supabase.from('fluxo_caixa').insert([
      { user_id: userId, semana: '2026-06-15', entradas: 45000, saidas: 28000 },
      { user_id: userId, semana: '2026-06-22', entradas: 52000, saidas: 31000 },
      { user_id: userId, semana: '2026-06-29', entradas: 38000, saidas: 24000 },
      { user_id: userId, semana: '2026-07-06', entradas: 61000, saidas: 35000 },
    ]);
    if (fluxoError) throw fluxoError;
    console.log('   ✓ 4 semanas de fluxo de caixa inseridas\n');

    // 4. DESPESAS
    console.log('4️⃣  Inserindo despesas...');
    const { error: despesasError } = await supabase.from('despesas').insert([
      { user_id: userId, categoria: 'Pessoal', valor: 45000, mes: '2026-07-01' },
      { user_id: userId, categoria: 'Infraestrutura', valor: 25000, mes: '2026-07-01' },
      { user_id: userId, categoria: 'Marketing', valor: 18000, mes: '2026-07-01' },
      { user_id: userId, categoria: 'Outros', valor: 12000, mes: '2026-07-01' },
    ]);
    if (despesasError) throw despesasError;
    console.log('   ✓ 4 categorias de despesas inseridas\n');

    // 5. METAS
    console.log('5️⃣  Inserindo metas...');
    const { error: metasError } = await supabase.from('metas').insert([
      { user_id: userId, nome: 'Faturamento Q2', meta: 500000, realizado: 485000, status: 'no-prazo', periodo: 'Q2' },
      { user_id: userId, nome: 'Novos Clientes', meta: 50, realizado: 48, status: 'no-prazo', periodo: 'Mensal' },
      { user_id: userId, nome: 'Taxa de Retenção', meta: 95, realizado: 92, status: 'no-prazo', periodo: 'Mensal' },
      { user_id: userId, nome: 'NPS Score', meta: 80, realizado: 75, status: 'atencao', periodo: 'Mensal' },
      { user_id: userId, nome: 'Margem Lucro', meta: 55, realizado: 54, status: 'no-prazo', periodo: 'Mensal' },
      { user_id: userId, nome: 'Satisfação Cliente', meta: 90, realizado: 87, status: 'no-prazo', periodo: 'Mensal' },
    ]);
    if (metasError) throw metasError;
    console.log('   ✓ 6 metas inseridas\n');

    // 6. PROGRESSO SEMANAL
    console.log('6️⃣  Inserindo progresso semanal...');
    const { error: progressoError } = await supabase.from('progresso_semanal').insert([
      { user_id: userId, semana: '2026-06-15', atingido: 15, meta: 25 },
      { user_id: userId, semana: '2026-06-22', atingido: 28, meta: 25 },
      { user_id: userId, semana: '2026-06-29', atingido: 31, meta: 25 },
      { user_id: userId, semana: '2026-07-06', atingido: 38, meta: 25 },
    ]);
    if (progressoError) throw progressoError;
    console.log('   ✓ 4 semanas de progresso inseridas\n');

    // 7. TICKETS
    console.log('7️⃣  Inserindo tickets...');
    const { error: ticketsError } = await supabase.from('tickets').insert([
      { user_id: userId, ticketId: '#TKT-2451', cliente: 'Acme Corp', assunto: 'Erro na integração', prioridade: 'alta', status: 'aberto', tempo_resposta: '2h 15m' },
      { user_id: userId, ticketId: '#TKT-2450', cliente: 'TechStart', assunto: 'Fatura em duplicata', prioridade: 'média', status: 'aberto', tempo_resposta: '1h 30m' },
      { user_id: userId, ticketId: '#TKT-2449', cliente: 'WebFlow', assunto: 'Reset de senha', prioridade: 'baixa', status: 'resolvido', tempo_resposta: '45m' },
      { user_id: userId, ticketId: '#TKT-2448', cliente: 'CloudSys', assunto: 'Dúvida sobre recurso', prioridade: 'baixa', status: 'resolvido', tempo_resposta: '1h 10m' },
      { user_id: userId, ticketId: '#TKT-2447', cliente: 'DataCore', assunto: 'Upgrade de plano', prioridade: 'média', status: 'aberto', tempo_resposta: '3h 20m' },
      { user_id: userId, ticketId: '#TKT-2446', cliente: 'SoftWare Inc', assunto: 'API timeout', prioridade: 'alta', status: 'aberto', tempo_resposta: '1h 45m' },
    ]);
    if (ticketsError) throw ticketsError;
    console.log('   ✓ 6 tickets inseridos\n');

    // 8. SATISFAÇÃO
    console.log('8️⃣  Inserindo satisfação...');
    const { error: satisfacaoError } = await supabase.from('satisfacao').insert([
      { user_id: userId, semana: '2026-06-15', nps: 68, satisfacao: 85 },
      { user_id: userId, semana: '2026-06-22', nps: 72, satisfacao: 87 },
      { user_id: userId, semana: '2026-06-29', nps: 75, satisfacao: 89 },
      { user_id: userId, semana: '2026-07-06', nps: 78, satisfacao: 91 },
    ]);
    if (satisfacaoError) throw satisfacaoError;
    console.log('   ✓ 4 semanas de satisfação inseridas\n');

    console.log('═════════════════════════════════════════');
    console.log('✅ SUCESSO! Todos os dados foram inseridos!');
    console.log('═════════════════════════════════════════\n');
    console.log('📊 Resumo:');
    console.log('   • 8 contatos');
    console.log('   • 6 receitas');
    console.log('   • 4 fluxos de caixa');
    console.log('   • 4 despesas');
    console.log('   • 6 metas');
    console.log('   • 4 progresso semanal');
    console.log('   • 6 tickets');
    console.log('   • 4 satisfação');
    console.log('\n💡 Próximo: npm run dev\n');

  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error.message);
    process.exit(1);
  }
}

// Executar
insertTestData();
