# Aplicar o modelo de software house

Quatro arquivos, nesta ordem. Todos já testados contra PostgreSQL 16.

## 1. Enviar para a VPS

```powershell
scp database/schema_softwarehouse.sql database/rpcs_softwarehouse.sql database/seed_softwarehouse.sql database/migration_crm_bridge.sql root@89.117.32.203:/tmp/
```

## 2. Aplicar (na VPS)

```bash
psql -U ravo_user -d ravo_db -h localhost -f /tmp/schema_softwarehouse.sql
psql -U ravo_user -d ravo_db -h localhost -f /tmp/rpcs_softwarehouse.sql
psql -U ravo_user -d ravo_db -h localhost -f /tmp/seed_softwarehouse.sql        # opcional: dados de demonstração
psql -U ravo_user -d ravo_db -h localhost -f /tmp/migration_crm_bridge.sql     # ponte CRM → contrato real
```

Esperado: sequência de `CREATE TABLE` / `CREATE FUNCTION` e um `COMMIT` ao final de cada arquivo,
sem nenhuma linha `ERROR`. Os `NOTICE: function ... does not exist, skipping` são normais
na primeira aplicação — é o `DROP FUNCTION IF EXISTS` fazendo seu trabalho.

`migration_crm_bridge.sql` precisa rodar **depois** de `schema_softwarehouse.sql` — ela adiciona
as colunas `tipo_receita` e `contrato_id` em `contatos` (schema antigo, tabela do CRM) e a segunda
referencia `contratos.id` (schema novo). É essa ponte que faz "Ganho" no CRM virar contrato de
verdade, em vez de só gravar nas tabelas antigas que o Dashboard não lê.

## 3. Recarregar o schema no PostgREST

O PostgREST cacheia a estrutura do banco na inicialização. Sem isso, as RPCs novas
retornam "Could not find function":

```bash
systemctl restart postgrest
curl http://127.0.0.1:3001/rpc/rpc_resumo_executivo
```

## 4. Rodar o frontend

```powershell
npm run dev
```

Login com as credenciais de `.env.local` (`VITE_AUTH_EMAIL` / `VITE_AUTH_PASSWORD`).

Para ver o dashboard com dados de demonstração sem depender da VPS, troque no `.env.local`:

```
VITE_USE_MOCK=true
```

---

## Ponto de atenção de segurança

O gate de login é do lado do cliente (ver `src/services/auth.ts`). Ele impede acesso casual
à interface, mas **não protege os dados**: quem souber a URL consulta o PostgREST direto.

Enquanto não houver JWT + RLS, restrinja a porta no firewall da VPS:

```bash
ufw allow from SEU_IP to any port 8080 proto tcp
ufw deny 8080/tcp
```

## O schema antigo

`schema.sql` e `seed.sql` são do modelo anterior (SaaS puro: contatos, subscriptions,
tickets). As tabelas coexistem sem conflito — nenhum nome colide. As páginas Financeiro,
Metas e CS ainda leem desse modelo antigo e por enquanto não recebem os contratos criados
pelo CRM — só o Dashboard executivo (Resultado/Previsibilidade/Carteira) lê o que entra
por `migration_crm_bridge.sql`. Quando essas páginas migrarem para o modelo novo, o schema
antigo pode ser removido.

## Limite conhecido: Pipeline ponderado e Saúde comercial do Dashboard

O CRM roda sobre a tabela `contatos` (schema antigo). As RPCs `rpc_pipeline` e
`rpc_saude_comercial` do Dashboard leem de `oportunidades` (schema novo) — uma tabela
diferente, ainda não alimentada pelo CRM. Por isso esses dois painéis do Dashboard
continuam mostrando os dados de exemplo do seed até essa unificação ser feita (fase 2,
ainda não construída). Forecast, Receita fechada, Win rate e Ciclo de venda do próprio
CRM já são calculados direto de `contatos` e estão corretos hoje.

---

## Aplicar `migration_atividades.sql` (CRM nível Pipedrive — ficha do lead)

Cria a tabela `atividades` (timeline/follow-up por lead), usada pela ficha lateral do
lead no CRM (nota, ligação, e-mail, reunião, tarefa — com data prevista e badge de
follow-up nos cards). Validada localmente contra uma réplica exata da `contatos` atual
da VPS antes de ser aplicada aqui.

### 1. Enviar para a VPS

```powershell
scp database/migration_atividades.sql root@89.117.32.203:/tmp/
```

### 2. Aplicar (na VPS)

```bash
psql -U ravo_user -d ravo_db -h localhost -f /tmp/migration_atividades.sql
```

Esperado: `BEGIN`, `CREATE TABLE`, dois `CREATE INDEX`, `ALTER TABLE` e `COMMIT`, sem
nenhuma linha `ERROR`.

### 3. Recarregar o schema no PostgREST

```bash
systemctl restart postgrest
curl -s http://127.0.0.1:3001/atividades?limit=1 -H "Authorization: Bearer SEU_JWT"
```

Esperado: `[]` (tabela vazia, mas acessível).

### 4. Rodar o frontend

Nenhuma variável de ambiente nova é necessária — a ficha do lead usa o mesmo
`VITE_POSTGREST_URL`/`VITE_POSTGREST_KEY` já configurado. Basta abrir qualquer lead
no CRM (clique no card ou na linha da lista) para ver a ficha lateral com o formulário
de atividade e a linha do tempo.
