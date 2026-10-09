#!/usr/bin/env bash
# =============================================================================
# RAVO CRM — instala o backend (Postgres + PostgREST + Nginx/TLS + backup)
# Uso (na VPS, como root):   bash setup.sh
# Seguro para rodar de novo: não recria banco, não troca segredos, não apaga dados.
# Segredos são gerados aqui e ficam só em /opt/ravo-crm/.env (chmod 600).
# =============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-api-crm.ravocompany.com.br}"
APP_DIR=/opt/ravo-crm
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VPS_IP="${VPS_IP:-89.117.32.203}"

say()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mERRO: %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "rode como root"
command -v docker >/dev/null || die "docker não encontrado"
docker compose version >/dev/null 2>&1 || die "docker compose não encontrado"
command -v nginx  >/dev/null || die "nginx não encontrado"

# ---------------------------------------------------------------- 1. arquivos
say "Copiando arquivos para $APP_DIR"
mkdir -p "$APP_DIR"
cp -r "$SRC_DIR/sql" "$SRC_DIR/docker-compose.yml" "$SRC_DIR/backup.sh" \
      "$SRC_DIR/nginx-api-crm.conf.tpl" "$SRC_DIR/nginx-ravo-crm-proxy.inc" "$APP_DIR/"
chmod +x "$APP_DIR/backup.sh"

# ---------------------------------------------------------------- 2. segredos
if [ ! -f "$APP_DIR/.env" ]; then
  say "Gerando segredos novos"
  umask 077
  cat > "$APP_DIR/.env" <<ENV
DB_PW=$(openssl rand -hex 24)
AUTH_PW=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -hex 32)
ENV
fi
chmod 600 "$APP_DIR/.env"
set -a; . "$APP_DIR/.env"; set +a
cd "$APP_DIR"

# ---------------------------------------------------------------- 3. banco
say "Subindo o Postgres"
docker compose up -d db
for i in $(seq 1 40); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' ravo-crm-db 2>/dev/null)" = healthy ] && break
  sleep 2
done
[ "$(docker inspect -f '{{.State.Health.Status}}' ravo-crm-db)" = healthy ] || die "Postgres não ficou saudável"

PSQL=(docker compose exec -T db psql -U ravo_admin -d ravo_db -v ON_ERROR_STOP=1 -q)

say "Aplicando schema e migrations"
"${PSQL[@]}" -v "auth_pw=$AUTH_PW" < sql/00_roles.sql
for f in 01_base_schema 10_schema_softwarehouse 11_rpcs_softwarehouse 12_crm_bridge 13_atividades \
         14_fix_finance_rpcs 15_fix_finance_rpcs_v2 16_fix_remaining_rpcs 17_fix_metas 18_fix_tickets 19_insights; do
  echo "   $f"; "${PSQL[@]}" < "sql/$f.sql" >/dev/null
done
"${PSQL[@]}" -v "jwt_secret=$JWT_SECRET" < sql/90_auth.sql
"${PSQL[@]}" < sql/95_grants.sql

# ---------------------------------------------------------------- 4. usuário
EXISTING=$("${PSQL[@]}" -At -c "SELECT count(*) FROM usuarios" | tr -d '[:space:]')
if [ "$EXISTING" = "0" ]; then
  say "Criando o seu usuário de acesso ao CRM"
  read -rp "   Email: " ADMIN_EMAIL
  read -rp "   Nome:  " ADMIN_NOME
  while true; do
    read -rsp "   Senha (mín. 10 caracteres): " ADMIN_PW; echo
    read -rsp "   Repita a senha: " ADMIN_PW2; echo
    [ "$ADMIN_PW" = "$ADMIN_PW2" ] && [ "${#ADMIN_PW}" -ge 10 ] && break
    echo "   Senhas diferentes ou curtas demais. Tente de novo."
  done
  export ADMIN_EMAIL ADMIN_NOME ADMIN_PW
  docker compose exec -T -e ADMIN_EMAIL -e ADMIN_NOME -e ADMIN_PW db sh -c \
    'psql -U ravo_admin -d ravo_db -v ON_ERROR_STOP=1 -q -v email="$ADMIN_EMAIL" -v nome="$ADMIN_NOME" -v pw="$ADMIN_PW"' <<'SQL'
INSERT INTO usuarios (email, nome, senha_hash, role)
VALUES (lower(trim(:'email')), :'nome', crypt(:'pw', gen_salt('bf')), 'ravo_user');
SQL
  echo "   Usuário criado."
else
  say "Já existem $EXISTING usuário(s); não crio outro (para adicionar: veja o README)"
fi

# ---------------------------------------------------------------- 5. API
say "Subindo o PostgREST"
docker compose up -d postgrest
code=000
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:3001/rpc/login \
         -H 'Content-Type: application/json' -d '{"email":"x@x.x","senha":"x"}' || true)
  case "$code" in 000|502|503) sleep 2 ;; *) break ;; esac   # 503 = API ainda subindo / sem banco
done
case "$code" in
  000|502|503) docker compose logs --tail 40 postgrest; die "PostgREST não ficou pronto (HTTP $code). Veja o log acima." ;;
esac
# 401/403 = a API chegou ao banco e rejeitou a credencial falsa (esperado)
echo "   API respondendo e conectada ao banco (login falso -> HTTP $code, esperado 401/403)"

# ---------------------------------------------------------------- 6. nginx + TLS
say "Configurando Nginx para $DOMAIN"
cp "$APP_DIR/nginx-ravo-crm-proxy.inc" /etc/nginx/ravo-crm-proxy.inc
CONF="/etc/nginx/sites-available/$DOMAIN.conf"
if [ ! -f "$CONF" ]; then
  sed "s/__DOMAIN__/$DOMAIN/g" "$APP_DIR/nginx-api-crm.conf.tpl" > "$CONF"
  ln -sf "$CONF" "/etc/nginx/sites-enabled/$DOMAIN.conf"
fi
nginx -t || die "configuração do nginx inválida (nada foi recarregado)"
systemctl reload nginx

RESOLVED=$(getent ahostsv4 "$DOMAIN" | awk '{print $1; exit}' || true)
if [ "$RESOLVED" = "$VPS_IP" ]; then
  if ! grep -q "ssl_certificate" "$CONF"; then
    command -v certbot >/dev/null || { apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx; }
    read -rp "   Email para avisos do certificado TLS: " CERT_EMAIL
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$CERT_EMAIL" --redirect
    nginx -t && systemctl reload nginx
  else
    echo "   Certificado já configurado."
  fi
else
  printf '\n\033[1;33mATENÇÃO: %s aponta para "%s" e deveria apontar para %s.\n' "$DOMAIN" "${RESOLVED:-nada}" "$VPS_IP"
  printf 'Crie o registro DNS tipo A e rode "bash setup.sh" de novo para emitir o certificado.\033[0m\n'
fi

# ---------------------------------------------------------------- 7. backup
say "Agendando backup diário (03:20)"
cat > /etc/cron.d/ravo-crm-backup <<CRON
20 3 * * * root /opt/ravo-crm/backup.sh >> /var/log/ravo-crm-backup.log 2>&1
CRON
chmod 644 /etc/cron.d/ravo-crm-backup
"$APP_DIR/backup.sh" && echo "   Primeiro backup gerado em /opt/backups/ravo-crm/"

say "Pronto"
echo "  API local : http://127.0.0.1:3001"
echo "  API pública: https://$DOMAIN  (depois do DNS + certificado)"
echo "  Próximo passo: na Vercel, defina VITE_POSTGREST_URL=https://$DOMAIN e faça redeploy."
