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

---

## Aplicar `migration_usuarios.sql` (login multi-usuário real)

Substitui o gate client-side (senha em texto puro no bundle JS público) por login validado
no servidor: tabela `usuarios` com senha em hash (pgcrypto), e um RPC `login()` que devolve
um JWT assinado com o mesmo `jwt-secret` do PostgREST (`/opt/postgrest/postgrest.conf`).

### 1. Copiar para a VPS

```powershell
scp database/migration_usuarios.sql root@89.117.32.203:/tmp/
```

### 2. Aplicar

```bash
psql -U ravo_user -d ravo_db -h localhost -f /tmp/migration_usuarios.sql
```

Esperado: `CREATE EXTENSION`, `CREATE TABLE`, três `CREATE FUNCTION`, dois `REVOKE`, `GRANT`,
`INSERT 0 1` e `COMMIT`, sem `ERROR`. O `INSERT` já cria seu usuário (`pablocnhenrique@gmail.com`)
com a senha atual (`RavoOS2026`) — só que agora em hash, e trocável sem redeploy.

### 3. Cadastrar o 2º usuário

```bash
psql -U ravo_user -d ravo_db -h localhost -c "
INSERT INTO usuarios (email, nome, senha_hash, role) VALUES
  ('EMAIL_AQUI', 'NOME_AQUI', crypt('SENHA_AQUI', gen_salt('bf')), 'ravo_user');
"
```

### 4. Recarregar o schema no PostgREST

```bash
systemctl restart postgrest
curl -s -X POST http://127.0.0.1:3001/rpc/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pablocnhenrique@gmail.com","senha":"RavoOS2026"}'
```

Esperado: um JSON com `token`, `email` e `nome`. Se vier `{"code":"PGRST202", ...Could not find
function...}`, o `systemctl restart postgrest` não recarregou o cache — repita.

### 5. Trocar senha ou desativar alguém depois

```sql
-- trocar senha
UPDATE usuarios SET senha_hash = crypt('NOVA_SENHA', gen_salt('bf')) WHERE email = 'email@x.com';

-- desativar (não apaga, só bloqueia o login)
UPDATE usuarios SET ativo = false WHERE email = 'email@x.com';
```

### Sobre o ponto de atenção de segurança acima

O login em si deixou de expor senha no bundle público — essa parte está resolvida. O que
**continua** pendente é o `db-anon-role = ravo_user` no `postgrest.conf`: mesmo sem login,
uma chamada anônima ao PostgREST ainda roda com privilégio total (é o mesmo papel usado
por usuários autenticados, só que sem token válido nenhuma rota aceita a chamada agora —
antes disso já era assim mesmo sem essa migration). Uma trava mais forte (RLS por usuário,
ou um `db-anon-role` realmente restrito) é o próximo passo natural, mas não é bloqueante
pra usar o login multi-usuário hoje.
