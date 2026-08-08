# Setup Supabase - RAVO OS

Guia rápido para configurar o banco (tabelas, funções RPC e segurança RLS).

## 📋 Pré-requisitos

- Projeto Supabase criado (https://app.supabase.com)
- Credenciais configuradas em `.env.local`
- Acesso ao SQL Editor do Supabase

## 🚀 Passo 1: Rodar o Schema

1. Acesse [Supabase Dashboard](https://app.supabase.com) → **SQL Editor** → **New Query**
2. Copie todo o conteúdo de `database/schema.sql` e clique em **Run**
3. (Opcional, dados de teste) Repita com `database/seed.sql`

> O schema é **idempotente**: pode rodar quantas vezes quiser, inclusive sobre um
> banco antigo — ele adiciona as colunas, funções e políticas que faltam.

## ✅ O que será criado

- **10 tabelas**: `contatos`, `customers`, `subscriptions`, `tickets`, `metas`,
  `receitas`, `fluxo_caixa`, `despesas`, `progresso_semanal`, `satisfacao`
- **12 funções RPC** — veja a lista completa em `database/SUPABASE_EXEC_STEPS.md`
- **RLS completo** em todas as tabelas (SELECT/INSERT/UPDATE/DELETE por `auth.uid()`)

## 🔒 Segurança (RLS)

- Cada usuário vê apenas os próprios dados (`auth.uid()`).
- `subscriptions` não tem `user_id` próprio: o acesso é mediado pelo `customers`
  correspondente via subquery.
- As políticas antigas são removidas automaticamente (`DROP POLICY IF EXISTS`).

## 📊 Dados de Teste

O `database/seed.sql` insere dados para o **primeiro usuário** de `auth.users`
(sem placeholder de UUID) com datas relativas a hoje:

- 8 contatos (CRM) + customers/subscriptions correspondentes
- 6 meses de receitas, 4 semanas de fluxo de caixa/despesas/progresso/satisfação
- 5 metas mensais e 5 tickets

> Se `auth.users` ainda estiver vazio, crie uma conta pelo login/signup da app e
> rode o seed novamente.

## 🔗 Relacionamento com Hooks React

```typescript
// Exemplo de uso
const { data: contatos, loading } = useContactsData();
const { data: dadosChart } = useContactsChartData();
```

## 🐛 Troubleshooting

### Erro: "function does not exist"
- Verifique se `database/schema.sql` foi executado por completo (todas as 12 RPCs).

### Erro: "RLS policy violation"
- Certifique-se de estar autenticado.
- Verifique se o `user_id` corresponde ao usuário autenticado.

### Dados não aparecem
- Confira se o `user_id` corresponde ao usuário autenticado.
- Teste a função RPC diretamente no SQL Editor.

## 🔐 Variáveis de Ambiente

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📞 Suporte

- [Supabase Docs](https://supabase.com/docs)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
