# Executar Migrations - Passo a Passo

## 🚀 Instruções Rápidas

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **SQL Editor** (esquerda)
4. Clique **New Query**

Execute os arquivos **na ordem** abaixo (clique em **Run** a cada um):

1. `database/schema.sql` — cria/atualiza **tabelas, índices, funções RPC e políticas RLS**.
   É idempotente: pode rodar de novo a qualquer momento (inclusive em um banco que já
   tinha a versão antiga — ele adiciona as colunas e políticas que faltam).
2. `database/seed.sql` — opcional, insere **dados de teste** para o primeiro usuário
   de `auth.users`. Também idempotente (não duplica ao re-executar).

## ✅ O que o schema.sql cria

### Tabelas (10)
- `contatos` — CRM/pipeline de vendas (inclui `origem`, `motivo`, `data_prevista`, `receita_integrada`)
- `customers` — clientes ativos/churnados (alimenta MRR, churn, LTV/CAC do Dashboard)
- `subscriptions` — planos e MRR por cliente
- `tickets` — suporte/CS (inclui `contato_id`)
- `metas` — metas mensais (inclui `mes`, `metrica`, `unidade`)
- `receitas`, `fluxo_caixa`, `despesas` — financeiro
- `progresso_semanal` — progresso das metas
- `satisfacao` — NPS

### Funções RPC (12)
- `get_contacts_by_month()` — novos/ativos por mês (CRM)
- `get_opportunities_by_stage()` — oportunidades por etapa (CRM)
- `get_sales_funnel()` — funil com conversão (Dashboard)
- `get_revenue_by_month()` — receita vs despesa (Financeiro/Dashboard)
- `get_cash_flow_by_week()` — fluxo de caixa semanal
- `get_expenses_by_category()` — despesas por categoria
- `get_goal_progress_by_week()` — progresso das metas
- `get_attendance_by_day()` — atendimentos diários (CS)
- `get_satisfaction_by_week()` — NPS por semana (CS)
- `get_mrr_by_month()` — MRR/ARR por mês (Dashboard)
- `get_churn_rate()` — churn e NRR por mês (Dashboard)
- `get_customer_metrics()` — Active Customers, MRR Total, CAC, LTV (Dashboard)

### Segurança (RLS)
- RLS habilitado em todas as tabelas.
- 4 políticas por tabela (SELECT/INSERT/UPDATE/DELETE) restringindo a `auth.uid()`.
- `subscriptions` usa subquery via `customers` (não tem `user_id` próprio).

## 🎉 Pronto!

Depois de rodar `schema.sql` (+ `seed.sql` para dados de teste), é só rodar `npm run dev`.

## 🔐 Variáveis de Ambiente

Tenha em `.env.local`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
