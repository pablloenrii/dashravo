# Aplicar o modelo de software house

Três arquivos, nesta ordem. Todos já testados contra PostgreSQL 16.

## 1. Enviar para a VPS

```powershell
scp database/schema_softwarehouse.sql database/rpcs_softwarehouse.sql database/seed_softwarehouse.sql root@89.117.32.203:/tmp/
```

## 2. Aplicar (na VPS)

```bash
psql -U ravo_user -d ravo_db -h localhost -f /tmp/schema_softwarehouse.sql
psql -U ravo_user -d ravo_db -h localhost -f /tmp/rpcs_softwarehouse.sql
psql -U ravo_user -d ravo_db -h localhost -f /tmp/seed_softwarehouse.sql   # opcional: dados de demonstração
```

Esperado: sequência de `CREATE TABLE` / `CREATE FUNCTION` e um `COMMIT` ao final de cada arquivo,
sem nenhuma linha `ERROR`. Os `NOTICE: function ... does not exist, skipping` são normais
na primeira aplicação — é o `DROP FUNCTION IF EXISTS` fazendo seu trabalho.

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
tickets). As tabelas coexistem sem conflito — nenhum nome colide. Quando o CRM e as
demais páginas migrarem para o modelo novo, elas podem ser removidas.
