# ✅ RAVO OS v2.0 — Pre-Deployment Checklist

Use este checklist antes de fazer deploy para produção.

## 🔧 Build & Code Quality

- [ ] `npm run lint` passa sem erros graves
- [ ] `npm run test` passa com cobertura > 80%
- [ ] `npm run build` compila sem warnings
- [ ] Nenhum `console.log()` ou `debugger` em código de produção
- [ ] Nenhuma variável de ambiente sensível em `.env` commitado
- [ ] `.env`, `.env.local`, `.env.*.local` estão em `.gitignore`

## 🔐 Security

- [ ] CORS configurado corretamente em `src/services/supabase.ts`
- [ ] Nenhuma chave de API exposita em código
- [ ] Supabase RLS (Row Level Security) ativado para tabelas sensíveis
- [ ] Autenticação obrigatória em rotas protegidas
- [ ] HTTPS ativado (automático no Vercel)
- [ ] Headers de segurança em `vercel.json`

## 📦 Dependencies

- [ ] Sem dependências desatualizadas: `npm outdated`
- [ ] Vulnerabilidades auditadas: `npm audit`
- [ ] Production build otimizado (minificado)
- [ ] Tree-shaking ativado em `vite.config.ts`

## 📋 Environment Variables

- [ ] `VITE_SUPABASE_URL` preenchida
- [ ] `VITE_SUPABASE_ANON_KEY` preenchida
- [ ] `VITE_ENVIRONMENT=production` definido
- [ ] `VITE_ENABLE_ANALYTICS=true` (recomendado)
- [ ] Todas as vars estão em **Vercel Settings → Environment Variables**
- [ ] Preview/staging vars estão separadas de production

## 🌐 Database (Supabase)

- [ ] Tabelas criadas em produção
- [ ] Migrations executadas: `supabase db push`
- [ ] RLS habilitado em tabelas sensíveis
- [ ] Indexes criados para queries frequentes
- [ ] Backups automáticos habilitados (padrão Supabase)

## 🧪 Testing

- [ ] Testes passam: `npm run test`
- [ ] Teste de autenticação manual (login/logout)
- [ ] Teste de real-time (adicionar lead, verificar sync)
- [ ] Teste offline (desconectar internet, adicionar item, reconectar)
- [ ] PWA install (testar "Add to Home Screen")
- [ ] Service Worker está cache-first funcional

## 📱 Performance

- [ ] Lighthouse score > 80 em performance
- [ ] First Contentful Paint (FCP) < 2s
- [ ] Core Web Vitals aprovados
- [ ] Images otimizadas (WebP, srcset)
- [ ] Bundle size < 500KB (gzipped)

## 🚀 Deployment

- [ ] GitHub repository é público ou privado? (se privado, Vercel pode acessar?)
- [ ] Branch `main` está atualizada e sem conflitos
- [ ] Todas as mudanças estão commitadas: `git status` limpo
- [ ] Tags de versão criadas: `git tag v2.0.0`
- [ ] Vercel CLI instalado: `vercel --version`
- [ ] Conta Vercel criada e logada
- [ ] Projeto Vercel criado (se usando Vercel CLI)

## ✨ Post-Deploy Validation

- [ ] App carrega em https://seu-dominio.vercel.app
- [ ] Login funciona com Supabase
- [ ] CRM, Finance, Goals carregam dados
- [ ] Real-time subscriptions funcionam
- [ ] Service Worker está ativo (DevTools → Application)
- [ ] Manifest.json acessível
- [ ] Sem erros no console do navegador
- [ ] Lighthouse score rodado em produção

## 📊 Monitoring

- [ ] Vercel Analytics ativado (Settings → Integrations)
- [ ] Sentry ou similar configurado (opcional)
- [ ] Error tracking ativado
- [ ] Performance monitoring ativado
- [ ] Logs do Vercel acessíveis: `vercel logs https://seu-dominio.vercel.app`

## 📄 Documentation

- [ ] README.md atualizado com instruções de deploy
- [ ] DEPLOYMENT.md completo e atual
- [ ] API documentation (se houver) atualizado
- [ ] CHANGELOG.md atualizado com v2.0.0

## 🎬 Final Steps

1. **Fazer commit final:**
   ```bash
   git add .
   git commit -m "chore: prepare v2.0.0 for production deployment"
   git push origin main
   ```

2. **Deploy via Vercel:**
   ```bash
   vercel deploy --prod
   ```

3. **Verificar status em:** https://vercel.com/dashboard

4. **Testar em produção:** https://seu-dominio.vercel.app

5. **Notificar stakeholders:**
   - [ ] Equipe informada
   - [ ] Changelog publicado
   - [ ] Release notes enviadas

---

## 🎉 Deployment Complete!

Se todos os items estão checados, sua aplicação está pronta para produção.

**Parabéns! RAVO OS v2.0 está live! 🚀**
