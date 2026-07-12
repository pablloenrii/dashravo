# RAVO OS — Sessão Cowork 12/07/2026

Objetivo: zerar erros de frontend, eliminar mock data, validar CRUD real. Status: **P1–P5 concluídos**.

## Diagnóstico real (diferente do handoff)

O handoff dizia "backend já resolvido". Não estava. Três bloqueios no banco impediam qualquer dado real de chegar ao frontend, independentemente da chave no `.env.local`:

1. **Role `anon` sem GRANTs** — alguém revogou `USAGE` no schema `public` e todos os privilégios de tabela. Toda chamada REST retornava *permission denied*, mascarado pelo fallback de mock. Restaurado o padrão Supabase (GRANT USAGE/ALL para anon/authenticated/service_role + default privileges).
2. **Policies de SELECT exigiam `auth.uid() = user_id`** — o app usa a chave anon sem login, então `auth.uid()` é NULL e tudo retornava vazio. Migradas para `USING (true)` (estado pré-auth v5, como previsto no plano — a migração para RLS por usuário é o item 1 da v6). O UPDATE de `contatos` tinha o mesmo problema e falhava silenciosamente.
3. **8 de 12 RPCs filtravam por `auth.uid()`** internamente → vazio para anon. Reescritas com `(auth.uid() IS NULL OR user_id = auth.uid())` — compatíveis com a v6. A RPC `get_expenses_by_category` **não existia** (criada). `get_sales_funnel` lia a tabela `contacts` (vazia) — reescrita sobre `contatos`. `get_mrr_by_month`/`get_churn_rate` reescritas (série cumulativa mensal; antes retornavam vazio) e marcadas `SECURITY DEFINER` para sobreviverem ao RLS de `subscriptions`/`customers`.

## Frontend

- **As 4 páginas roteadas (Dashboard, CRM, Finance, Goals) usavam dados hardcoded** — nem chamavam os hooks. Todas reescritas consumindo os hooks reais, com loading skeleton e banner de erro (`src/components/QueryState.tsx`), mantendo a identidade visual (3 cores, border-left, dark).
- **CRM agora tem CRUD real** contra `contatos` (insert/update/delete + refetch de KPIs e gráficos).
- **Arquitetura de dados nova**: `src/hooks/useSupabaseQuery.ts` — helper genérico com estado de erro por hook, proteção contra race conditions (generation counter), `refetch()`, e `toNumber()` para colunas NUMERIC (Supabase retorna string no JSON). `usePagesQueries.ts` e `useMetricsQueries.ts` reescritos sobre ele, sem `any`.
- **Mock data**: fallback automático removido. Mock só com `VITE_USE_MOCK=true` (documentado no `.env.example`). `useMockData.ts` virou constantes puras.
- **CommandPalette**: reset de índice ao filtrar + guarda para lista vazia (TypeError histórico).
- **ThemeToggle**: usava `{ theme, toggleTheme }` que não existem no ThemeContext (`mode`/`toggleMode`) — bug de runtime em TODAS as páginas via AppLayout. Corrigido.
- **Login/Signup**: usavam `<Card>` sem import (crash). Corrigido + `Alert` ganhou prop `className`.
- **Env files**: `.env.local` já estava correto; `.env.production` tinha a chave corrompida e `.env.production.local` apontava para o projeto Supabase ANTIGO (`gpmtiftdnxyxtdpwiscf`) — e esse arquivo tem prioridade máxima no build. Ambos corrigidos.
- **`src/vite-env.d.ts` criado** (tipagem de `import.meta.env`).

## TypeScript: 119 → 0 erros

Corrigidos ~40 erros em código vivo (imports não usados, tipagens, props erradas). Arquivos **mortos** (não alcançáveis a partir de `main.tsx`) excluídos do typecheck em `tsconfig.json` com comentário — **remover fisicamente na v6**: `src/modules/`, `src/pages/DashboardPremium.tsx`, `DashboardMinimal.tsx`, `CSPage.tsx`, `src/sw.ts`.

## Segurança (P4)

RLS habilitada em `triages`, `subscriptions`, `invoices`, `activities`. Validado: anon lê 0 linhas nelas. Dashboard continua funcionando pois as RPCs `SECURITY DEFINER` fazem a leitura controlada. Atenção: `subscriptions`/`customers` SÃO usadas pelo Dashboard (via RPC) — o handoff supunha que não.

## Validação (P5)

- CRUD completo em `contatos` como role `anon`: INSERT → UPDATE → DELETE ✔ (sem resíduo)
- 12 RPCs retornando dados para anon ✔
- `tsc --noEmit`: 0 erros ✔
- `vite build`: sucesso em ~16s ✔ (único aviso: chunk >500 kB — informativo; code-splitting é item da v6)
- Bundle de produção aponta para o projeto correto ✔

## Pendências conhecidas

- Rodar `npm run dev` local e navegar nas 4 páginas para confirmação visual final (sandbox sem acesso de rede ao Supabase).
- `user_id` das tabelas de CRUD tem DEFAULT fixo (usuário seed) até a v6 trazer auth real.
- Mock data ainda entra no bundle (flag-gated) — remoção total na v6.
