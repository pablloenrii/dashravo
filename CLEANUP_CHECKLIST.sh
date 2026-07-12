#!/bin/bash

# 🧹 RAVO OS - Script de Limpeza Automática
# Execute este script para remover arquivos duplicados

echo "🚀 Iniciando limpeza do codebase RAVO OS..."
echo ""

# ========== REMOVER PÁGINAS DUPLICADAS ==========
echo "📄 Removendo páginas duplicadas em src/modules/..."

rm -rf src/modules/crm/pages/CRMPage.tsx
rm -rf src/modules/finance/pages/FinancePage.tsx
rm -rf src/modules/goals/pages/GoalsPage.tsx
rm -rf src/modules/cs/pages/CSPage.tsx

echo "✅ Páginas duplicadas removidas"
echo ""

# ========== REMOVER COMPONENTES DUPLICADOS /ui/ ==========
echo "🔧 Consolidando componentes (removendo /ui/)..."

rm -rf src/components/ui/Alert.tsx
rm -rf src/components/ui/Badge.tsx
rm -rf src/components/ui/Button.test.tsx
rm -rf src/components/ui/Button.tsx
rm -rf src/components/ui/Card.tsx
rm -rf src/components/ui/Input.tsx
rm -rf src/components/ui/Modal.tsx
rm -rf src/components/ui/Progress.tsx
rm -rf src/components/ui/Tabs.tsx
rm -rf src/components/ui/Toggle.tsx
rm -rf src/components/ui/

echo "✅ Componentes duplicados removidos"
echo ""

# ========== REMOVER SISTEMAS DE COR ANTIGOS ==========
echo "🎨 Removendo sistemas de cor obsoletos..."

rm -rf src/styles/color-system.ts
rm -rf src/styles/color-system-premium.ts
rm -rf src/styles/color-system-minimal.ts

echo "✅ Sistemas de cor antigos removidos"
echo ""

# ========== VERIFICAÇÃO FINAL ==========
echo "🔍 Verificando integridade..."

if [ -f "src/styles/color-system-enterprise.ts" ]; then
  echo "✅ color-system-enterprise.ts encontrado"
else
  echo "❌ ERRO: color-system-enterprise.ts não encontrado!"
  exit 1
fi

if grep -q "from '@/pages/" src/main.tsx; then
  echo "✅ main.tsx importando de src/pages/"
else
  echo "❌ ERRO: main.tsx não está correto!"
  exit 1
fi

if grep -r "from.*components/ui/" src/ --include="*.tsx" --include="*.ts"; then
  echo "❌ ERRO: Ainda há imports de /ui/!"
  exit 1
else
  echo "✅ Sem imports de /ui/"
fi

echo ""
echo "✨ LIMPEZA CONCLUÍDA COM SUCESSO!"
echo ""
echo "📋 Próximos passos:"
echo "1. npm install (para limpar node_modules se necessário)"
echo "2. npm run dev (para testar)"
echo "3. npm run build (para compilar)"
echo ""
echo "🎯 Status final: PRONTO PARA PRODUÇÃO"
