# Estrutura do Projeto RAVO OS v2.0

```
dashravo/
├── 📄 package.json              ← Dependências & scripts
├── 📄 tsconfig.json             ← Configuração TypeScript
├── 📄 vite.config.ts            ← Configuração Vite
├── 📄 .env.example              ← Template de variáveis
├── 📄 .gitignore                ← Arquivos para ignorar
├── 📄 README.md                 ← Documentação principal
│
├── 📂 public/                   ← Assets estáticos
│   ├── index.html              ← Template HTML
│   ├── favicon.svg
│   └── robots.txt
│
├── 📂 src/
│   ├── 📄 main.ts              ← Entry point da app
│   ├── 📄 index.css            ← Estilos globais
│   │
│   ├── 📂 config/              ← ⚙️ Configurações
│   │   ├── constants.ts        ← Constantes do app
│   │   ├── env.ts              ← Variáveis de ambiente
│   │   └── routes.ts           ← Mapeamento de rotas
│   │
│   ├── 📂 types/               ← 📋 Type definitions
│   │   ├── index.ts            ← Tipos centralizados
│   │   ├── api.ts              ← Tipos de resposta API
│   │   └── [...].ts            ← Tipos específicos
│   │
│   ├── 📂 services/            ← 🔧 Lógica de negócio
│   │   ├── supabase.ts         ← Cliente Supabase
│   │   ├── auth.ts             ← Autenticação
│   │   ├── crm.ts              ← Operações CRM
│   │   ├── finance.ts          ← Financeiro
│   │   ├── goals.ts            ← Metas
│   │   ├── cs.ts               ← Customer Success
│   │   └── cache.ts            ← Gerenciamento de cache
│   │
│   ├── 📂 modules/             ← 🎯 Módulos by feature
│   │   ├── auth/
│   │   │   ├── login.ts        ← Template HTML login
│   │   │   ├── login.css       ← Estilos login
│   │   │   └── types.ts        ← Tipos específicos
│   │   │
│   │   ├── dashboard/
│   │   │   ├── overview.ts     ← Vista principal
│   │   │   ├── hero.ts         ← Seção hero/greeting
│   │   │   ├── charts.ts       ← Renderização gráficos
│   │   │   ├── panels.ts       ← Painéis operacionais
│   │   │   └── styles.css      ← Estilos dashboard
│   │   │
│   │   ├── crm/
│   │   │   ├── crm.ts          ← Módulo principal
│   │   │   ├── clients.ts      ← Grid de clientes
│   │   │   ├── pipeline.ts     ← Kanban + tabela
│   │   │   ├── forms.ts        ← Modais de novo lead/cliente
│   │   │   └── styles.css
│   │   │
│   │   ├── finance/
│   │   │   ├── finance.ts
│   │   │   ├── dre.ts          ← DRE mensal
│   │   │   ├── charts.ts       ← Gráficos financeiro
│   │   │   ├── forms.ts        ← Registrar receita/despesa
│   │   │   └── styles.css
│   │   │
│   │   ├── goals/
│   │   │   ├── goals.ts
│   │   │   ├── metrics.ts      ← KPI cards
│   │   │   ├── calculator.ts   ← Decomposição
│   │   │   └── styles.css
│   │   │
│   │   └── cs/
│   │       ├── cs.ts           ← Module principal
│   │       ├── health.ts       ← Health score
│   │       ├── touchpoints.ts  ← Registro de touchpoints
│   │       └── styles.css
│   │
│   ├── 📂 components/          ← 🎨 Componentes reutilizáveis
│   │   ├── Chart.ts            ← Wrapper Chart.js
│   │   ├── Modal.ts            ← Sistema de modais
│   │   ├── Toast.ts            ← Notificações
│   │   ├── Sidebar.ts          ← Sidebar navegação
│   │   ├── Topbar.ts           ← Top bar
│   │   ├── FormField.ts        ← Campo de formulário
│   │   ├── Table.ts            ← Tabela genérica
│   │   └── Button.ts           ← Botão padrão
│   │
│   ├── 📂 utils/               ← 🛠️ Funções auxiliares
│   │   ├── format.ts           ← Moeda, números, datas
│   │   ├── validate.ts         ← Validação de input
│   │   ├── date.ts             ← Manipulação de datas
│   │   ├── calculate.ts        ← Cálculos de negócio
│   │   ├── fetch.ts            ← Wrapper de fetch
│   │   └── logger.ts           ← Sistema de logs
│   │
│   ├── 📂 styles/              ← 🎨 CSS modular
│   │   ├── variables.css       ← Design tokens
│   │   ├── layout.css          ← Grid/flex layout
│   │   ├── components.css      ← Componentes
│   │   ├── animations.css      ← Keyframes
│   │   ├── responsive.css      ← Media queries
│   │   └── themes/
│   │       ├── dark.css        ← Tema escuro (default)
│   │       └── light.css       ← Tema claro (future)
│   │
│   └── 📂 __tests__/           ← 🧪 Testes
│       ├── services/
│       │   ├── crm.test.ts
│       │   └── finance.test.ts
│       ├── components/
│       │   └── Modal.test.ts
│       ├── utils/
│       │   └── format.test.ts
│       └── e2e/
│           └── dashboard.e2e.ts
│
└── 📂 docs/                    ← 📚 Documentação
    ├── README.md               ← Índice de docs
    ├── ARCHITECTURE.md         ← Arquitetura detalhada
    ├── BUGLIST.md              ← Bugs encontrados & corrigidos
    ├── CONTRIBUTING.md         ← Como contribuir
    ├── SECURITY.md             ← Segurança
    ├── DEPLOY.md               ← Deploy guide
    ├── supabase-schema.sql     ← Schema do banco
    └── API.md                  ← Documentação de services
```

---

## 📋 O que vai aonde

### Adicionar nova **Tabela** no Supabase
→ `src/types/index.ts` + `docs/supabase-schema.sql`

### Adicionar novo **Service** (CRM, Finance, etc)
→ `src/services/novo-service.ts`

### Adicionar novo **Módulo** (página/aba)
→ `src/modules/novo-modulo/`

### Adicionar novo **Componente** reutilizável
→ `src/components/NovoComponente.ts`

### Adicionar novo **Utilitário**
→ `src/utils/novo-util.ts`

### Adicionar **Estilos** globais
→ `src/styles/novo-aspecto.css`

### Adicionar **Testes**
→ `src/__tests__/categoria/nome.test.ts`

### Adicionar **Documentação**
→ `docs/novo-topico.md`

---

## 🚀 Estrutura de Pastas vs Estrutura de Código

```
FÍSICO (arquivo .ts)          LÓGICO (classe/função)
───────────────────────────────────────────────────

src/modules/crm/
  └─ crm.ts                   CRMModule (class)
  └─ clients.ts               renderClients()
  └─ pipeline.ts              renderPipeline()
  └─ forms.ts                 openLeadModal()

src/services/
  └─ crm.ts                   crmService {
                                createClient()
                                getClients()
                                updateClient()
                                deleteClient()
                              }

src/utils/
  └─ validate.ts              validators {
                                naoVazio()
                                email()
                                numero()
                              }
```

---

## ✅ Checklist: Criar Novo Módulo

```
[ ] 1. Criar pasta em src/modules/novo-modulo/
[ ] 2. Criar arquivo novo-modulo.ts com Module class
[ ] 3. Criar arquivos .css com estilos
[ ] 4. Importar types necessários em types/index.ts
[ ] 5. Criar service em src/services/ se precisar
[ ] 6. Registrar module em src/main.ts
[ ] 7. Adicionar teste em src/__tests__/novo-modulo/
[ ] 8. Documentar em docs/README.md
[ ] 9. Fazer PR & code review
[ ] 10. Deploy após merge
```

---

## 🔀 Fluxo de Dados Padrão

```
Usuário → UI (Módulo) → Service → Supabase → Cache → Re-render
   ↑                                                      │
   └──────────────────────────────────────────────────────┘
```

**Exemplo: Criar Cliente**

1. **Usuário** preenche form em `CRM Module`
2. **Module** valida input localmente
3. **Module** chama `crmService.createClient(data)`
4. **Service** valida novamente (server-side)
5. **Service** chama `sb.from('clientes_ravo').insert()`
6. **Supabase** valida constraints, insere, retorna
7. **Service** atualiza cache local
8. **Service** retorna resultado para Module
9. **Module** re-renderiza grid + mostra Toast.success()
10. **Supabase** envia real-time update (outros usuários)

---

## 🎯 Responsabilidade por Camada

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| **UI (Módulo)** | Renderização & interação | Cliques, forms, animações |
| **Componente** | UI reutilizável | Modal, Toast, Chart |
| **Service** | Lógica de negócio | CRUD, validação, cache |
| **Utils** | Funções auxiliares | Format, validate, date |
| **Supabase** | Persistência | Database, auth, realtime |

---

Última atualização: 3 de Julho de 2026
