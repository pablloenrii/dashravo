# 🧪 Testing Production Build Locally

Antes de fazer deploy, teste a build de produção localmente para garantir que tudo funciona.

## 1️⃣ Passo 1: Preparar Ambiente

```bash
# Copiar variáveis de exemplo
cp .env.example .env.local

# Editar .env.local e preencher:
# VITE_SUPABASE_URL=sua_url_aqui
# VITE_SUPABASE_ANON_KEY=sua_chave_aqui
# VITE_ENVIRONMENT=production
```

## 2️⃣ Passo 2: Rodar Testes

```bash
# Executar suite de testes completa
npm run test

# Verificar cobertura
npm run test:coverage

# Se houver erros, corrija antes de continuar
```

## 3️⃣ Passo 3: Lint e Build

```bash
# Verificar erros de lint
npm run lint

# Build para produção
npm run build

# Se houver erros, corrija no código
```

## 4️⃣ Passo 4: Visualizar Build

```bash
# Servir a build em localhost:4173
npm run preview

# Abrir no navegador:
# http://localhost:4173
```

## 5️⃣ Passo 5: Testes Manuais (Importante!)

Quando a preview estiver rodando, teste:

### ✅ Autenticação
```
1. Clicar em "Login"
2. Entrar com email/senha válidos
3. Verificar se redireciona para dashboard
4. Clicar "Logout"
5. Verificar se volta para login
```

### ✅ CRM Module
```
1. Clicar em "CRM"
2. Verificar se lista de leads carrega
3. Adicionar novo lead:
   - Nome: "Test Lead"
   - Email: "test@example.com"
   - Status: "Lead"
4. Verificar se aparece na lista (real-time)
5. Editar lead
6. Deletar lead
```

### ✅ Finance Module
```
1. Clicar em "Finance"
2. Verificar se transações carregam
3. Adicionar nova transação
4. Verificar se balance atualiza
5. Filtrar por mês
```

### ✅ Goals Module
```
1. Clicar em "Goals"
2. Verificar se goals carregam
3. Adicionar novo goal
4. Atualizar progresso
5. Verificar cálculo de % completado
```

### ✅ Customer Success
```
1. Clicar em "CS"
2. Verificar clientes e tickets
3. Adicionar novo cliente
4. Criar novo ticket de suporte
5. Alterar status de ticket
```

### ✅ Offline Mode
```
1. Abrir DevTools (F12)
2. Ir em Application → Service Workers
3. Verificar que Service Worker está ativo
4. Desconectar internet (DevTools → Network → Offline)
5. Tentar adicionar um novo item
6. Reconectar internet
7. Verificar se sincroniza automaticamente
```

### ✅ PWA Installation
```
1. Abrir em navegador Chrome
2. Clicar no ícone de app (barra de endereço)
3. Selecionar "Install" ou "Add to Home Screen"
4. Verificar se instala e abre como app
5. Testar se funciona offline
```

### ✅ Performance
```
1. Abrir DevTools (F12)
2. Ir em Lighthouse
3. Rodar análise de "Performance"
4. Verificar score > 80
5. Checar Core Web Vitals
```

### ✅ Console Errors
```
1. Abrir DevTools (F12)
2. Ir em Console
3. Verificar se há erros (deve estar limpo)
4. Navegar por todas as páginas
5. Verificar se console permanece limpo
```

## 6️⃣ Passo 6: Verificar Build Size

```bash
# Analisar tamanho do bundle
npm run build:analyze  # se disponível

# Ou listar tamanho dos arquivos
# Windows:
dir /s dist\

# Linux/Mac:
du -sh dist/
```

**Objetivo:** Tamanho total < 500KB (gzipped)

## 7️⃣ Passo 7: Verificar Variáveis de Ambiente

Na build de produção, verifique se:
```
✅ VITE_SUPABASE_URL está correto
✅ VITE_SUPABASE_ANON_KEY está correto
✅ VITE_ENVIRONMENT=production
✅ VITE_ENABLE_REAL_TIME=true
✅ VITE_ENABLE_OFFLINE_MODE=true
```

## 8️⃣ Passo 8: Checklist Final Antes do Deploy

```
[ ] npm run test passou
[ ] npm run build sem erros
[ ] npm run preview funciona
[ ] Autenticação funciona
[ ] CRM funciona (CRUD)
[ ] Finance funciona (transações)
[ ] Goals funciona (progresso)
[ ] CS funciona (clientes e tickets)
[ ] Offline mode funciona
[ ] PWA instala corretamente
[ ] Console sem erros
[ ] Service Worker ativo
[ ] Lighthouse > 80
[ ] .env.local está em .gitignore (não commitar!)
```

## 9️⃣ Problemas Comuns

### Build falha com "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Service Worker não carrega
```
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Ir em DevTools → Application → Clear storage
3. Recarregar página (Ctrl+F5)
4. Verificar em DevTools → Application → Service Workers
```

### Real-time não funciona
```
1. Verificar conexão com Supabase: 
   - Abrir DevTools → Network
   - Procurar por requisições para supabase.co
2. Verificar se VITE_SUPABASE_URL está correto
3. Verificar se tabelas têm RLS configurado
```

### Offline mode não funciona
```
1. Verificar se Service Worker está ativo
2. Confirmar que índexedDB está habilitado
3. Limpar storage: DevTools → Application → Clear storage
4. Recarregar página
5. Testar offline novamente
```

## 🎉 Sucesso!

Se todos os testes passaram, sua build está pronta para deploy!

```bash
# Fazer commit
git add .
git commit -m "chore: tested production build successfully"

# Deploy
vercel deploy --prod
```

---

**Tempo estimado:** 15-30 minutos
**Frequência recomendada:** Antes de cada deploy
