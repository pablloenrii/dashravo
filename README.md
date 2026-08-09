# RAVO OS

**Enterprise Operations Platform** — Central de Operações Estratégicas (CRM, Financeiro, Metas, Customer Success e Dashboard).

Interface profissional dark-first, inspirada em Linear/Stripe/Vercel, construída com React + TypeScript + Supabase.

## Stack

- **React 18** + **TypeScript** (strict) — UI
- **Vite 8** — build, code-splitting por página e chunks de vendor
- **React Router v7** — rotas
- **Zustand** — estado global (toasts, revalidação pós-CRUD)
- **Supabase** — autenticação, banco (PostgreSQL + RLS) e RPCs de métricas
- **Recharts** — gráficos
- **Lucide React** — ícones
- **Vitest + Testing Library** — testes (threshold de cobertura no CI)

## Módulos

| Rota | Página | Descrição |
|------|--------|-----------|
| `/dashboard` | `Dashboard.tsx` | MRR/ARR, churn, funil, métricas comerciais, drill-down |
| `/crm` | `CRMPage.tsx` | Kanban de leads com drag-and-drop + CRUD real |
| `/cs` | `CSPage.tsx` | Tickets, atendimento, NPS |
| `/finance` | `FinancePage.tsx` | Receitas, despesas, fluxo de caixa, DRE |
| `/goals` | `GoalsPage.tsx` | Metas (manuais ou automáticas, puxadas do CRM) |

Todas as telas compartilham um **período global** (mês a mês) no header — os gráficos reagem ao mês selecionado.

## Começando

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente (obrigatório — o build falha sem as credenciais)
cp .env.example .env.local
#  VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
#  VITE_SUPABASE_ANON_KEY=sua_chave_anon

# 3. Aplicar o schema no Supabase (SQL Editor → database/schema.sql)
#    e, se quiser dados de exemplo, database/seed.sql

# 4. Rodar
npm run dev   # http://localhost:5173
```

> **Mock de dados (desenvolvimento):** defina `VITE_USE_MOCK=true` no `.env.local`. No build de produção esse caminho é eliminado do bundle.

## Scripts

```bash
npm run dev             # desenvolvimento (hot reload)
npm run build           # build de produção
npm run preview         # preview do build
npm test                # testes unitários (Vitest)
npm run test:coverage   # testes + relatório de cobertura
npm run lint            # ESLint
npm run type-check      # tsc --noEmit
npm run insert-data     # insere dados de teste no Supabase
```

## Estrutura

Veja [ESTRUTURA.md](./ESTRUTURA.md) para o mapa de pastas e [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) para o fluxo de dados.

## Banco de dados

- Schema canônico (tabelas + RPCs + RLS): [`database/schema.sql`](./database/schema.sql)
- Dados de exemplo: [`database/seed.sql`](./database/seed.sql)
- **Importante:** após alterar as RPCs, re-aplique o `schema.sql` no Supabase antes do deploy — o frontend chama as funções por nome e parâmetro.

## Qualidade

- CI (`.github/workflows/deploy.yml`): type-check → lint → testes com coverage → build → deploy Vercel.
- RLS ativa em todas as tabelas (cada usuário só enxerga os próprios registros).
- Credenciais somente via variáveis de ambiente; fail-fast no build se faltarem.

---

**RAVO OS** — Enterprise Operations Platform
