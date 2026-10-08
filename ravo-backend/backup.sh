#!/usr/bin/env bash
# Backup diário do ravo_db (retenção 14 dias). Instalado em /etc/cron.d pelo setup.sh
set -euo pipefail
DEST=/opt/backups/ravo-crm
mkdir -p "$DEST"
OUT="$DEST/ravo_db-$(date +%Y%m%d-%H%M%S).sql.gz"
docker exec ravo-crm-db pg_dump -U ravo_admin -d ravo_db --no-owner | gzip -9 > "$OUT"
# backup vazio/corrompido = alerta
if [ "$(stat -c%s "$OUT")" -lt 2000 ]; then
  echo "ALERTA: backup do ravo_db suspeito ($OUT)" > "$DEST/ALERTA-BACKUP.txt"; exit 1
fi
rm -f "$DEST/ALERTA-BACKUP.txt"
find "$DEST" -name 'ravo_db-*.sql.gz' -mtime +14 -delete
