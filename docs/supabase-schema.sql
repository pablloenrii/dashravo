# Schema Supabase — referência

> **Fonte da verdade:** `database/schema.sql`
>
> Este documento é um índice. O arquivo executável (idempotente) que deve ser
> aplicado no SQL Editor do Supabase é o `database/schema.sql`. Dados de teste
> ficam em `database/seed.sql`.

## Tabelas (10)

| Tabela | Módulo | Colunas relevantes |
|---|---|---|
| `contatos` | CRM | `etapa`, `valor`, `origem`, `motivo`, `data_prevista`, `receita_integrada` |
| `customers` | Dashboard | `status`, `custo_aquisicao`, `churned_at` |
| `subscriptions` | Dashboard | `customer_id`, `mrr`, `status` |
| `tickets` | CS | `ticketid`, `contato_id`, `prioridade`, `status`, `tempo_resposta` |
| `metas` | Goals | `meta`, `realizado`, `mes`, `metrica`, `unidade` |
| `receitas` | Finance | `mes`, `receita`, `despesa`, `lucro` |
| `fluxo_caixa` | Finance | `semana`, `entradas`, `saidas` |
| `despesas` | Finance | `categoria`, `valor`, `mes` |
| `progresso_semanal` | Goals | `semana`, `atingido`, `meta` |
| `satisfacao` | CS | `semana`, `nps`, `satisfacao` |

## Funções RPC (12)

CRM: `get_contacts_by_month`, `get_opportunities_by_stage`
Dashboard: `get_sales_funnel`, `get_mrr_by_month`, `get_churn_rate`, `get_customer_metrics`
Finance: `get_revenue_by_month`, `get_cash_flow_by_week`, `get_expenses_by_category`
Goals: `get_goal_progress_by_week`
CS: `get_attendance_by_day`, `get_satisfaction_by_week`

## Segurança (RLS)

Todas as tabelas têm RLS habilitado com políticas `SELECT/INSERT/UPDATE/DELETE`
por `auth.uid()`. `subscriptions` media acesso via `customers`.

## Última atualização

07 de agosto de 2026 — schema consolidado (substitui os arquivos fragmentados
`supabase-migrations.sql`, `RLS_POLICIES_CRITICAL.sql` e `INSERT_TEST_DATA_FIXED.sql`).
