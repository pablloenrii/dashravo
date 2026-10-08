# RAVO CRM — backend (Postgres + PostgREST)

Recria a API do CRM numa VPS. Tudo em Docker, nada exposto direto na internet.

```
Vercel (crm.ravocompany.com.br)  ──HTTPS──▶  Nginx (api-crm.ravocompany.com.br)
                                               └▶ PostgREST (127.0.0.1:3001) ─▶ Postgres 16 (container, sem porta pública)
```

## Instalar (VPS, como root)

Pré-requisito: registro DNS **A** `api-crm.ravocompany.com.br → 89.117.32.203`.

```bash
git clone https://github.com/pablloenrii/dashravo.git /root/dashravo   # ou: cd /root/dashravo && git pull
bash /root/dashravo/ravo-backend/setup.sh
```

O script: sobe o banco, aplica o schema e as migrations, gera `jwt-secret`/senhas novas (ficam só em `/opt/ravo-crm/.env`), pergunta e-mail/senha do seu usuário, sobe o PostgREST, configura Nginx + TLS (certbot) e agenda backup diário às 03:20 em `/opt/backups/ravo-crm/`. Pode rodar de novo sem perder dados.

## Depois (Vercel)

1. Projeto `dashravo` → Settings → Environment Variables → `VITE_POSTGREST_URL = https://api-crm.ravocompany.com.br` (Production).
2. Redeploy. **Não** use `crm.ravocompany.com.br` como URL da API: é o domínio do próprio frontend.

## Operação

```bash
cd /opt/ravo-crm
docker compose ps                         # estado
docker compose logs --tail 50 postgrest   # logs da API
docker compose exec db psql -U ravo_admin -d ravo_db      # SQL como admin
# novo usuário:
docker compose exec db psql -U ravo_admin -d ravo_db -c \
  "INSERT INTO usuarios(email,nome,senha_hash) VALUES ('email@x.com','Nome',crypt('SENHA-FORTE',gen_salt('bf')))"
# trocar senha / desativar:
#   UPDATE usuarios SET senha_hash=crypt('NOVA',gen_salt('bf')) WHERE email='...';
#   UPDATE usuarios SET ativo=false WHERE email='...';
# restaurar backup:
#   gunzip -c /opt/backups/ravo-crm/ravo_db-AAAAMMDD-HHMMSS.sql.gz | docker compose exec -T db psql -U ravo_admin -d ravo_db
```

## Segurança

- Anônimo só executa `login()`; tudo mais exige JWT (12h). Tabela `usuarios` e o segredo JWT (`private.config`) não são acessíveis pela API.
- Nginx limita o login a 10 tentativas/min por IP e só libera CORS para `crm.ravocompany.com.br`, `dashravo.vercel.app` e `localhost:5173`.
- Single-tenant: todo usuário logado enxerga todos os dados (sem RLS por usuário), como era antes.
- O `/opt/backups/ravo-crm` fica no mesmo servidor: inclua-o no `sync-backup-offsite.sh` para ter cópia externa.

## Observação sobre o schema

As tabelas-base (`01_base_schema.sql`) foram **reconstruídas** a partir do código e das migrations (o banco antigo foi perdido e o repositório não tinha o DDL original). As 22 funções RPC usadas pelo frontend foram executadas contra ele em teste.
