# 🚀 RAVO OS v2.0 — Guia de Deployment

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Vercel
- Projeto Supabase configurado
- GitHub repository conectado

---

## 📋 Passo 1: Preparar Variáveis de Ambiente

### Local Development

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha:
- `VITE_SUPABASE_URL` — URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` — Chave anônima do Supabase

### Produção (Vercel)

Na dashboard do Vercel, vá para **Settings → Environment Variables** e adicione:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
```

---

## 🔧 Passo 2: Build Local

Teste o build localmente antes de fazer push:

```bash
npm run build
npm run preview
```

Se tudo compilar sem erros, você está pronto!

---

## 📤 Passo 3: Deploy no Vercel

### Opção A: Vercel CLI (Recomendado)

```bash
npm install -g vercel
vercel login
vercel deploy
```

### Opção B: GitHub Integration (Automático)

1. Va para vercel.com e clique "New Project"
2. Selecione seu repositório GitHub
3. Vercel detectará automaticamente Vite
4. Clique "Deploy"
5. Depois de sucesso, qualquer push em `main` faz deploy automático

---

## ✅ Passo 4: Validar Deploy

Após deploy, verifique:

```bash
# 1. Verificar que a app está rodando
curl https://seu-dominio.vercel.app/

# 2. Verificar Service Worker
curl https://seu-dominio.vercel.app/sw.js

# 3. Verificar Manifest
curl https://seu-dominio.vercel.app/manifest.json

# 4. Abrir no navegador e testar:
# - Login com Supabase
# - Adicionar um lead (real-time)
# - Desconectar internet (testar offline)
```

---

## 🔐 Variáveis de Ambiente Seguras

**NUNCA** commite `.env` ou `.env.local`:

```bash
# .gitignore já contém:
.env
.env.local
.env.*.local
```

Para cada ambiente use:
- **Development**: `.env.local` (Git-ignored)
- **Staging**: Vercel preview (via GitHub Actions)
- **Production**: Vercel production (secrets)

---

## 📊 Monitoramento Pós-Deploy

### Verificar Logs no Vercel

```bash
vercel logs https://seu-dominio.vercel.app
```

### Health Check Script

```javascript
// Adicione este endpoint para health checks
// GET /api/health
export default async function handler(req, res) {
  return res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    version: '2.0.0'
  });
}
```

---

## 🐛 Troubleshooting

### Build falha com "Cannot find module"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Variáveis de ambiente não aparecem

1. Verificar se estão em **Settings → Environment Variables** no Vercel
2. Redeploy: `vercel redeploy`
3. Verificar nome das variáveis (case-sensitive)

### Service Worker não carregando

1. Confirmar que `public/manifest.json` existe
2. Confirmar que `src/sw.ts` está em `vite.config.ts`
3. Limpar cache do navegador (Ctrl+Shift+Delete)

---

## 🔄 CI/CD com GitHub Actions

Arquivo: `.github/workflows/deploy.yml`

A cada push em `main`:
1. ✅ Instala dependências
2. ✅ Roda testes
3. ✅ Build da aplicação
4. ✅ Deploy automático no Vercel

Ver status em GitHub → Actions

---

## 📝 Comandos Úteis

```bash
# Build para produção
npm run build

# Visualizar build localmente
npm run preview

# Testes antes de deploy
npm run test

# Lint antes de commit
npm run lint

# Deploy via Vercel CLI
vercel deploy --prod
```

---

## ✨ You're Live!

Sua aplicação agora está:
- ✅ Rodando em HTTPS
- ✅ Com CDN global (Vercel Edge Network)
- ✅ Auto-scaling
- ✅ Backups automáticos
- ✅ Domínio customizado (opcional)

**Parabéns! 🎉**
