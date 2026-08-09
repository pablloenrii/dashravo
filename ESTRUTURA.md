# Estrutura do Projeto — RAVO OS

Mapa de pastas atual (React + TypeScript + Vite). A estrutura segue **feature-first**: páginas em `pages/`, lógica de dados em `hooks/`, componentes reutilizáveis em `components/`.

```
dashravo/
├── 📄 package.json               ← Dependências & scripts
├── 📄 tsconfig.json              ← TypeScript (strict)
├── 📄 vite.config.ts             ← Vite (env validation, code-splitting)
├── 📄 vitest.config.ts           ← Testes (coverage thresholds)
├── 📄 .env.example               ← Template de variáveis
├── 📄 .eslintrc.cjs              ← ESLint
│
├── 📂 database/                  ← Fonte de verdade do banco
│   ├── schema.sql                ← Tabelas + RPCs + RLS (idempotente)
│   └── seed.sql                  ← Dados de exemplo
│
├── 📂 public/                    ← Assets estáticos (favicon, manifest)
│
├── 📂 src/
│   ├── 📄 main.tsx               ← Entry point (rotas, auth guard, lazy-load)
│   ├── 📄 index.css              ← Utilities + tema claro
│   │
│   ├── 📂 pages/                 ← Páginas (rotas)
│   │   ├── Dashboard.tsx         ← MRR/churn/funil + drill-down
│   │   ├── CRMPage.tsx           ← Kanban de leads + CRUD
│   │   ├── FinancePage.tsx       ← Receitas/despesas/fluxo
│   │   ├── GoalsPage.tsx         ← Metas (manuais e automáticas)
│   │   ├── CSPage.tsx            ← Tickets + NPS
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   │
│   ├── 📂 layouts/
│   │   └── AppLayout.tsx         ← Sidebar + header + período global
│   │
│   ├── 📂 hooks/                 ← Queries de dados (Supabase)
│   │   ├── useSupabaseQuery.ts   ← Hook genérico (race-safe, mock via flag)
│   │   ├── useMetricsQueries.ts  ← RPCs do Dashboard (MRR, churn, funil…)
│   │   ├── usePagesQueries.ts    ← RPCs e tabelas de CRM/Finance/Goals/CS
│   │   ├── useNotifications.ts   ← Alertas cross-tabela
│   │   └── useMockData.ts        ← Mocks (só com VITE_USE_MOCK=true)
│   │
│   ├── 📂 contexts/
│   │   ├── PeriodContext.tsx     ← Período global (mês, persistência localStorage)
│   │   └── ThemeContext.tsx      ← Tema (light/dark + accent)
│   │
│   ├── 📂 store/
│   │   ├── revalidate.store.ts   ← Invalidação global pós-CRUD
│   │   └── toast.store.ts        ← Sistema de toasts (Zustand)
│   │
│   ├── 📂 components/            ← Componentes reutilizáveis
│   │   ├── Button.tsx, Input.tsx, Modal.tsx, Table.tsx
│   │   ├── MetricCard.tsx, KPICardMinimal.tsx, ChartCard.tsx
│   │   ├── ChartTooltip.tsx, ProgressBar.tsx, Badge.tsx, Alert.tsx
│   │   ├── QueryState.tsx        ← Loading/erro de query
│   │   ├── ErrorBoundary.tsx, ErrorBoundaryVisual.tsx
│   │   ├── RequireAuth.tsx, PeriodSelector.tsx
│   │   ├── CommandPalette.tsx, SearchBar.tsx, Breadcrumb.tsx
│   │   ├── ThemeToggle.tsx, MobileMenu.tsx, NotificationsPanel.tsx
│   │   └── QueryState.tsx
│   │
│   ├── 📂 utils/
│   │   ├── format.ts             ← fmtMoney/fmtK/pctChange (fonte única)
│   │   ├── crmMetrics.ts         ← Regras de CRM (fases, win rate, forecast)
│   │   ├── tickets.ts            ← parse de tempo de resposta
│   │   └── toast.ts
│   │
│   ├── 📂 constants/
│   │   └── theme.ts              ← Design tokens (cores, superfícies, tipografia)
│   │
│   ├── 📂 services/
│   │   └── supabase.ts           ← Cliente Supabase (valida env)
│   │
│   ├── 📂 styles/
│   │   ├── minimalist.css        ← Design system (tokens CSS dark)
│   │   ├── color-system.ts       ← Paleta TS (legado, em migração)
│   │   └── color-system-premium.ts
│   │
│   └── 📂 test/                  ← Testes unitários (Vitest)
│       ├── setup.ts
│       ├── format.test.ts, period.test.ts, PeriodContext.test.tsx
│       ├── stores.test.ts, toastUtils.test.ts, themeContext.test.tsx
│       ├── useSupabaseQuery.test.tsx, useNotifications.test.tsx
│       ├── requireAuth.test.tsx, table.test.tsx, errorBoundary.test.tsx
│       └── components.test.tsx, components-dinamic.test.tsx,
│           components-navigation.test.tsx, crmMetrics.test.ts, tickets.test.ts
│
└── 📂 docs/                      ← Documentação
    ├── ARCHITECTURE.md           ← Arquitetura e fluxo de dados
    └── BUGLIST.md                ← Histórico de bugs corrigidos
```

## O que vai aonde

| Ação | Arquivo |
|------|---------|
| Adicionar nova **página** | `src/pages/` + rota em `src/main.tsx` |
| Adicionar nova **query de dados** | `src/hooks/usePagesQueries.ts` ou `useMetricsQueries.ts` |
| Criar nova **tabela/RPC** | `database/schema.sql` + hook correspondente |
| Criar **componente** reutilizável | `src/components/Nome.tsx` |
| Adicionar **formatação/regra** | `src/utils/` |
| Mudar **cores/design tokens** | `src/constants/theme.ts` + `src/styles/minimalist.css` |
| Adicionar **teste** | `src/test/nome.test.ts` |

## Convenções rápidas

- **Tipos e transformações** ficam junto dos hooks (`usePagesQueries.ts` exporta os tipos `ContactData`, `GoalData`, etc.).
- **Erros reais aparecem na UI** — não há fallback silencioso para mock (mock só via `VITE_USE_MOCK=true`).
- **Nova consulta Supabase** → use `useSupabaseQuery` (já protege contra race conditions e re-executa com `reloadDeps`).
- **Pós-CRUD** → chame `useRevalidateStore.getState().invalidate()` para revalidar notificações e cards.

---

Última atualização: Agosto de 2026
