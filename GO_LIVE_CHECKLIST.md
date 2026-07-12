# 🚀 RAVO OS v5.0 - GO LIVE CHECKLIST

**Status:** ✅ PRONTO PARA PRODUÇÃO  
**Data:** 10/07/2026  
**Tempo Estimado:** 30 minutos  

---

## 📋 ANTES DE INICIAR

- [ ] Terminal aberto na pasta do projeto
- [ ] Acesso ao Supabase Dashboard
- [ ] Navegador com DevTools

---

## ⚡ FASE 1: SUPABASE (5 minutos)

### ✅ 1. Executar RLS Policies
1. Abra **Supabase Dashboard** → **SQL Editor**
2. Cole TODO o conteúdo de: `database/RLS_POLICIES_CRITICAL.sql`
3. Clique **RUN**
4. Confirme que rodou sem erros

**Arquivo:** `database/RLS_POLICIES_CRITICAL.sql`

---

## ⚡ FASE 2: DADOS DE TESTE (3 minutos)

### ✅ 2. Inserir 42 Registros
```bash
npm run insert-data
```

Aguarde até ver:
```
✅ Concluído! 42 registros inseridos em 8 tabelas
```

**Arquivo:** `scripts/insert-test-data.mjs`

---

## ⚡ FASE 3: DESENVOLVIMENTO LOCAL (10 minutos)

### ✅ 3. Limpar node_modules e instalar
```bash
rm -rf node_modules package-lock.json
npm install
```

### ✅ 4. Iniciar Dev Server
```bash
npm run dev
```

Aguarde até ver:
```
VITE v8.1.3  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## ✅ FASE 4: TESTES MANUAIS (12 minutos)

### Abra http://localhost:5173 e teste:

#### 📊 Dashboard
- [ ] Página carrega sem erros
- [ ] Gráficos aparecem
- [ ] KPIs mostram valores (não "--")
- [ ] Console limpo (F12 → Console)

#### 💼 CRM
- [ ] 8 contatos aparecem na tabela
- [ ] Gráfico "Novos Contatos" mostra dados
- [ ] PieChart "Oportunidades por Estágio" mostra dados
- [ ] KPIs dinâmicos (320, 895, 18.9%, R$ 892K)

#### 💰 Finance
- [ ] 6 receitas no gráfico "Receita vs Despesa"
- [ ] 4 fluxos de caixa no gráfico
- [ ] 4 despesas listadas
- [ ] KPIs dinâmicos (R$ 215K, R$ 117K, 54.4%, R$ 324K)

#### 🎯 Goals
- [ ] 4 progressos semanais no gráfico
- [ ] 6 metas listadas com barras de progresso
- [ ] KPIs dinâmicos (97%, 5 de 6, 1, R$ 515K)

#### 🎫 CS
- [ ] 6 tickets listados com prioridades coloridas
- [ ] Gráfico "Atendimentos Diários" mostra dados
- [ ] Gráfico "Satisfação" mostra NPS/Satisfação
- [ ] KPIs dinâmicos (838, 99.6%, 78, 1h 30m)

#### 🔍 Validação Extra
- [ ] Sem erros no Console
- [ ] Sem warnings amarelos/vermelhos
- [ ] Páginas carregam em <2 segundos
- [ ] Sem memory leaks (F12 → Performance)

---

## 📱 FASE 5: RESPONSIVIDADE (2 minutos)

### Redimensione o browser
- [ ] Desktop (1920x1080) - OK
- [ ] Tablet (768x1024) - OK
- [ ] Mobile (375x667) - OK

Atoe F12 → Device Toolbar → Diferentes tamanhos

---

## 🐛 FASE 6: VERIFICAÇÃO DE ERROS

### Se houver erros:

**Erro:** "Cannot read properties of undefined"
- [ ] Executar `npm run insert-data` novamente
- [ ] Refresh a página (Ctrl+F5)

**Erro:** "Fetch failed" no Console
- [ ] Verificar `.env.local` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Verificar internet connection

**Erro:** "RLS policy violation"
- [ ] Verificar se as RLS policies foram executadas
- [ ] Confirmar em Supabase Dashboard → Tables → RLS

**Gráficos vazios:**
- [ ] Verificar se dados foram inseridos: `npm run insert-data`
- [ ] Aguardar 5 segundos (real-time sync)
- [ ] Refresh (Ctrl+R)

---

## ✅ FASE 7: GO LIVE

Se todos os testes passaram:

### 1. Commit e Push
```bash
git add .
git commit -m "🚀 RAVO OS v5.0 - Production Ready"
git push origin main
```

### 2. Build Production
```bash
npm run build
```

Aguarde até ver:
```
✓ built in XXXms
```

### 3. Deploy Vercel (OPCIONAL)
Se você tem Vercel configurado:
```bash
npm install -g vercel
vercel --prod
```

---

## 📊 STATUS FINAL

| Componente | Status | Nota |
|-----------|--------|------|
| Supabase | ✅ | RLS policies ativas |
| Dados | ✅ | 42 registros inseridos |
| Dashboard | ✅ | Gráficos + KPIs |
| CRM | ✅ | 8 contatos + charts |
| Finance | ✅ | 6 receitas + 4 despesas |
| Goals | ✅ | 4 progressos + 6 metas |
| CS | ✅ | 6 tickets + 2 charts |
| Type Safety | ✅ | Sem `any` types |
| Memory Leaks | ✅ | Corrigidos |
| Error Handling | ✅ | Completo |
| Segurança | ✅ | .env protegido |

---

## 🎯 RESULTADO ESPERADO

✅ Sistema **100% funcional**  
✅ **Zero bugs críticos**  
✅ **Pronto para produção**  
✅ **Seguro para uso**  

---

## 📞 SUPORTE

Se algo não funcionar:
1. Verificar Console (F12)
2. Rodar `npm run insert-data` novamente
3. Fazer refresh completo (Ctrl+Shift+R)
4. Se persistir, reinstalar: `rm -rf node_modules && npm install`

---

**Tempo Total: ~30 minutos**  
**Resultado: RAVO OS v5.0 em Produção** 🚀
