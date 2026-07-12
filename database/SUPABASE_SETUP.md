# Setup Supabase - DASHRAVO

Guia completo para configurar as tabelas e funções SQL necessárias no Supabase.

## 📋 Pré-requisitos

- Projeto Supabase criado (https://app.supabase.com)
- Credenciais de autenticação configuradas em `.env.local`
- Acesso ao SQL Editor do Supabase

## 🚀 Passo 1: Executar as Migrations

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor** (lado esquerdo)
4. Clique em **New Query**
5. Copie todo o conteúdo de `supabase-migrations.sql`
6. Cole no editor
7. Clique em **Run**

## ✅ O que será criado

### Tabelas
- ✓ `contatos` - Dados de CRM
- ✓ `tickets` - Tickets de suporte
- ✓ `metas` - Metas e objetivos
- ✓ `receitas` - Dados financeiros de receita
- ✓ `fluxo_caixa` - Fluxo de caixa semanal
- ✓ `despesas` - Despesas por categoria
- ✓ `progresso_semanal` - Progresso das metas
- ✓ `satisfacao` - NPS e satisfação

### Funções RPC
- ✓ `get_contacts_by_month()` - Novos contatos por mês
- ✓ `get_opportunities_by_stage()` - Oportunidades por estágio
- ✓ `get_revenue_by_month()` - Receita vs despesa
- ✓ `get_cash_flow_by_week()` - Fluxo de caixa semanal
- ✓ `get_expenses_by_category()` - Despesas por categoria
- ✓ `get_goal_progress_by_week()` - Progresso das metas
- ✓ `get_attendance_by_day()` - Atendimentos diários
- ✓ `get_satisfaction_by_week()` - Satisfação por semana

## 🔒 Segurança (RLS)

Todas as tabelas têm Row Level Security (RLS) habilitado:
- Cada usuário vê apenas seus próprios dados
- Políticas de SELECT, INSERT, UPDATE configuradas
- Auth.uid() garante isolamento de dados

## 📊 Inserir Dados de Teste

### Opção 1: Via SQL (Supabase Editor)

Descomente a seção de dados de exemplo no arquivo `supabase-migrations.sql` e execute novamente.

### Opção 2: Via Aplicação

Você pode inserir dados diretamente da aplicação React usando:

```typescript
import { sb } from '@/services/supabase';

// Inserir contato
await sb.from('contatos').insert({
  nome: 'João Silva',
  empresa: 'Acme Corp',
  email: 'joao@example.com',
  etapa: 'Qualificado',
  valor: 45000
});
```

### Opção 3: Via Supabase Editor

Acesse **SQL Editor** > **New Query** e execute:

```sql
-- Inserir contatos
INSERT INTO contatos (user_id, nome, empresa, email, etapa, valor) VALUES
  (auth.uid(), 'João Silva', 'Acme Corp', 'joao@example.com', 'Qualificado', 45000),
  (auth.uid(), 'Maria Santos', 'TechStart', 'maria@example.com', 'Proposta', 28000),
  (auth.uid(), 'Pedro Costa', 'WebFlow', 'pedro@example.com', 'Contatado', 12000);

-- Inserir receita (exemplo)
INSERT INTO receitas (user_id, mes, receita, despesa, lucro) VALUES
  (auth.uid(), '2026-07-01', 215000, 98000, 117000),
  (auth.uid(), '2026-06-01', 185000, 95000, 90000);

-- Inserir metas
INSERT INTO metas (user_id, nome, meta, realizado, status) VALUES
  (auth.uid(), 'Faturamento Q2', 500000, 485000, 'no-prazo'),
  (auth.uid(), 'Novos Clientes', 50, 48, 'no-prazo');
```

## 🔗 Relacionamento com Hooks React

Os hooks criados em `src/hooks/usePagesQueries.ts` chamam essas funções automaticamente:

```typescript
// Exemplo de uso
const { data: contatos, loading } = useContactsData();
const { data: dadosChart } = useContactsChartData();
```

## 📱 Estrutura de Dados Esperada

### Contatos
```json
{
  "id": "uuid",
  "nome": "string",
  "empresa": "string",
  "email": "string",
  "etapa": "Contatado|Qualificado|Proposta|Fechado",
  "valor": 45000,
  "created_at": "timestamp"
}
```

### Tickets
```json
{
  "id": "uuid",
  "ticketId": "#TKT-2451",
  "cliente": "string",
  "assunto": "string",
  "prioridade": "alta|média|baixa",
  "status": "aberto|resolvido",
  "created_at": "timestamp"
}
```

### Metas
```json
{
  "id": "uuid",
  "nome": "string",
  "meta": 500000,
  "realizado": 485000,
  "status": "no-prazo|atencao|concluido",
  "created_at": "timestamp"
}
```

## 🐛 Troubleshooting

### Erro: "function does not exist"
- Verifique se todos os `CREATE FUNCTION` foram executados
- Tente recarregar a página do Supabase

### Erro: "RLS policy violation"
- Certifique-se de estar autenticado
- Verifique se o `user_id` está correto
- Confira as políticas RLS

### Dados não aparecem
- Verifique se dados foram inseridos na tabela correta
- Confira se o `user_id` corresponde ao usuário autenticado
- Teste a função RPC diretamente no SQL Editor

## 📝 Próximos Passos

1. ✓ Tabelas criadas
2. ✓ Funções SQL criadas
3. ✓ Hooks React integradores
4. ⏳ Inserir dados de teste
5. ⏳ Testar `npm run dev`
6. ⏳ Criar formulários para adicionar dados
7. ⏳ Implementar atualização em tempo real

## 🔐 Variáveis de Ambiente

Certifique-se de ter em `.env.local`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📞 Suporte

Para mais informações, consulte:
- [Supabase Docs](https://supabase.com/docs)
- [SQL Functions](https://supabase.com/docs/guides/database/functions)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
