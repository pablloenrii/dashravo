# RAVO OS — Arquitetura

**Versão**: 6.x · **Atualizado**: Agosto de 2026

Este documento descreve a arquitetura **real** do projeto (React 18 + TypeScript + Vite + Supabase). Se algo aqui conflita com o código, o código é a fonte da verdade.

---

## Visão geral

```
┌────────────────────────────────────────────────────────────┐
│                        ROUTER (main.tsx)                    │
│  BrowserRouter → RequireAuth → AppLayout → Suspense → Página│
└────────────────────────────────────────────────────────────┘
          │ provê contexto de tema e período
          ▼
┌────────────────────────────────────────────────────────────┐
│  Contextos                      Stores (Zustand)            │
│  ThemeContext (light/dark+accent)  toast.store (toasts)     │
│  PeriodContext (mês global)        revalidate.store (pós-CRUD)│
└────────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────────┐
│  Páginas (src/pages)  →  Componentes reutilizáveis         │
│  Dashboard · CRM · CS · Finance · Goals                    │
│  → ChartCard · MetricCard · Table · Modal · QueryState…    │
└────────────────────────────────────────────────────────────┘
          │ consome
          ▼
┌────────────────────────────────────────────────────────────┐
│  Hooks de dados (src/hooks)                                │
│  useSupabaseQuery (genérico: race-safe + mock opcional)    │
│  useMetricsQueries · usePagesQueries · useNotifications     │
└────────────────────────────────────────────────────────────┘
          │ .from(...) / .rpc(...)
          ▼
┌────────────────────────────────────────────────────────────┐
│  Supabase (database/schema.sql)                            │
│  PostgreSQL + RLS (auth.uid()) + RPCs de métricas          │
└────────────────────────────────────────────────────────────┘
```

**Princípios centrais:**

1. **Período global único** — `PeriodContext` guarda o mês selecionado; os hooks derivam `ref_month` e **toda** query (tabela ou RPC) filtra por esse mês. Mudou o mês no header, tudo recalcula.
2. **Erro nunca é silencioso** — uma RPC que falha aparece como banner de erro na UI. Não existe fallback automático para mock.
3. **Mock é uma flag** — `VITE_USE_MOCK=true` ativa o branch de mock (import dinâmico de `useMockData.ts`). No build de produção esse chunk é eliminado estaticamente.
4. **Camada fina** — sem services/controllers intermediários: página → hook → Supabase. Lógica de transformação mora nos hooks e `utils/`.

---

## Camadas

### 1. Rotas e Auth — `src/main.tsx`

- Páginas são carregadas com `React.lazy()` (code-splitting por rota).
- `RequireAuth` redireciona para `/login` sem sessão.
- `AppLayout` fornece sidebar, header, seletor de período, command palette e notificações.
- `ErrorBoundary` global captura erros de render.

### 2. Contextos

- **`PeriodContext`** — mês `'YYYY-MM'` (ou `null` = "Todo o período"), persistido em `localStorage`. Helpers de mês (`monthStart`, `monthEnd`, `monthISO`, `isInMonth`, `recentMonths`, …) ficam no próprio arquivo e são testados.
- **`ThemeContext`** — tema light/dark + cor de destaque, aplicados via atributos no `<html>`.

### 3. Stores (Zustand)

- **`toast.store`** — fila de notificações (success/error/info).
- **`revalidate.store`** — `invalidate()` dispara revalidação de notificações/cards após CRUD, sem recarregar a página.

### 4. Hooks de dados

- **`useSupabaseQuery<T>`** — hook genérico com:
  - proteção contra *race conditions* (generation counter + cleanup);
  - `transform` para converter colunas `NUMERIC` (o JSON do Supabase traz string) — ex.: `toNumber()`;
  - `reloadDeps` para reexecutar quando o mês muda;
  - `mockKey` usado apenas com `VITE_USE_MOCK=true`.
- **`useMetricsQueries`** — RPCs do Dashboard (MRR, churn, funil, clientes).
- **`usePagesQueries`** — RPCs/tabelas de CRM, Finance, Goals e CS. Tipos exportados aqui (`ContactData`, `GoalData`, …).
- **`useNotifications`** — alertas derivados de várias tabelas (ex.: leads parados, churn de assinatura), revalidados via store.

### 5. Supabase — `src/services/supabase.ts`

- Cliente único com validação de env (falha rápido no boot).
- RPCs definidas em `database/schema.sql`. **Toda RPC de métrica recebe `ref_month`** e agrega dentro do mês selecionado (período global).
- RLS: toda tabela tem políticas `SELECT/INSERT/UPDATE/DELETE` com `auth.uid() = user_id` (cada usuário enxerga só os próprios dados). `subscriptions` media o acesso via `customers` (mesmo dono).

### 6. Componentes

Reutilizáveis e sem lógica de negócio: `Button`, `Input`, `Modal`, `Table`, `MetricCard`, `KPICardMinimal`, `ChartCard`, `ChartTooltip`, `ProgressBar`, `Badge`, `Alert`, `QueryState` (loading/erro de query), `ErrorBoundaryVisual`, `PeriodSelector`, `SearchBar`, `CommandPalette`, `ThemeToggle`, `NotificationsPanel`, `Breadcrumb`.

- **`ChartCard`** — wrapper padrão de gráficos (título, subtítulo, rodapé com fonte, largura do `Chart.js` container via ResizeObserver). Usado por todas as páginas que têm gráfico.

### 7. Utils e constantes

- **`src/utils/format.ts`** — fonte única de formatação: `fmtMoney`, `fmtK`, `pctChange`. Páginas não devem reimplementar.
- **`src/utils/crmMetrics.ts`** — regras de CRM (fases, win rate, forecast).
- **`src/utils/tickets.ts`** — parse de `tempo_resposta`.
- **`src/constants/theme.ts`** — design tokens (cores de série, superfícies) compartilhados com os charts.

---

## Fluxo de dados (exemplo: Dashboard)

```
1. PeriodContext.expone month = '2026-08'
2. useMetricsQueries monta: rpc('get_mrr_by_month', { ref_month: '2026-08', user_id })
3. useSupabaseQuery executa (loading=true)
4. RPC no Postgres: filtra por user_id e mês, agrega MRR
5. transform: toNumber() nas colunas NUMERIC
6. Página renderiza MetricCards + ChartCard
7. Usuário muda o mês no header → reloadDeps muda → query re-executa
```

**Após CRUD** (ex.: mover lead no kanban):

```
1. usePagesQueries.updateContact(...)
2. revalidateStore.invalidate()
3. useNotifications re-executa → alertas atualizam sem F5
```

---

## Banco de dados

- **Schema canônico:** [`database/schema.sql`](../database/schema.sql) — idempotente (`DROP ... IF EXISTS`), tabelas + índices + RLS + RPCs. Re-aplicar após mudar RPCs.
- **Seed:** [`database/seed.sql`](../database/seed.sql) — dados de exemplo por usuário.
- **Tabelas:** `contatos`, `customers`, `subscriptions`, `tickets`, `metas`, `receitas`, `fluxo_caixa`, `despesas`, `progresso_semanal`, `satisfacao`.
- **RPCs de métrica** (`get_*`) recebem `ref_month` (e `user_id`) — sem isso não respeitam o período global.
- **`docs/supabase-schema.sql`** é um índice-resumo; a fonte executável é o `database/schema.sql`.

---

## Testes

- Vitest + Testing Library (`vitest.config.ts`, thresholds ≥80% no CI).
- Cobertura mensurável via `coverage.include` (core unitário): `utils`, `store`, `constants`, `contexts`, `components` e `useSupabaseQuery`. Páginas/layouts/services (camadas finas de integração) ficam de fora.
- Testes: formatação, stores (toast/revalidate), ThemeContext, PeriodContext, useSupabaseQuery, useNotifications (Supabase mockado), RequireAuth (Supabase mockado), Table (sort/paginação/seleção), ErrorBoundary e todos os componentes apresentacionais.

## Qualidade

- CI (`.github/workflows/deploy.yml`): `type-check` → `lint` → `test:coverage` → `build` → deploy Vercel.
- Scripts: `npm run dev | build | preview | test | test:coverage | lint | type-check`.

---

**Se você estiver lendo um trecho que descreve classes `Module`, `services/cache.ts` ou Chart.js: é documentação antiga, já substituída.**
