# RAVO OS — Arquitetura Detalhada

**Versão**: 2.0  
**Data**: 3 de Julho de 2026  
**Autor**: Dev Senior / Engenharia  
**Status**: Production Ready ✅

---

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    UI LAYER                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │   Dashboard  │ │     CRM      │ │   Finance    │ │
│  │   (Module)   │ │   (Module)   │ │   (Module)   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│              COMPONENTS LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────┐ ┌──────────┐   │
│  │  Modal   │ │  Toast   │ │Chart │ │ Sidebar  │   │
│  └──────────┘ └──────────┘ └──────┘ └──────────┘   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│              SERVICES LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐  │
│  │  Auth Svc   │ │  CRM Svc    │ │ Finance Svc  │  │
│  └─────────────┘ └─────────────┘ └──────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐  │
│  │ Goals Svc   │ │   CS Svc    │ │  Cache Svc   │  │
│  └─────────────┘ └─────────────┘ └──────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│          DATA PERSISTENCE LAYER                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         Supabase (PostgreSQL)                  │ │
│  │  - Autenticação (Auth)                         │ │
│  │  - Clientes (Table)                            │ │
│  │  - Pipeline (Table)                            │ │
│  │  - Financeiro (Table)                          │ │
│  │  - Metas (Table)                               │ │
│  │  - Touchpoints (Table)                         │ │
│  │  - Real-time Subscriptions                     │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Responsabilidades por Camada

### UI Layer (Modules)
**Responsabilidade**: Renderização e interação com usuário

```typescript
// src/modules/crm/crm.ts
export const CRMModule: Module = {
  name: 'crm',
  
  async init() {
    // 1. Carregar dados iniciais
    // 2. Setup event listeners
    // 3. Inicializar submodules (kanban, tabela)
  },
  
  async render(container) {
    // 1. Renderizar estrutura HTML
    // 2. Atualizar estado visual
    // 3. Bind click/form handlers → services
  },
  
  async cleanup() {
    // 1. Remover event listeners
    // 2. Unsubscribe de websockets
    // 3. Limpar cache local se necessário
  }
}
```

**Cada módulo:**
- Não conhece implementação interna de outros módulos
- Comunica via Services (camada de negócio)
- Dispara eventos para notificar estado
- Pode ter sub-módulos próprios

---

### Components Layer
**Responsabilidade**: Componentes reutilizáveis sem lógica de negócio

```typescript
// src/components/Modal.ts
export class Modal {
  constructor(config: ModalConfig) {}
  
  open() { /* abre modal */ }
  close() { /* fecha modal */ }
  render(content: HTMLElement) { /* renderiza conteúdo */ }
}

// src/components/Toast.ts
export class Toast {
  static success(message: string) { /* toast verde */ }
  static error(message: string) { /* toast vermelho */ }
  static info(message: string) { /* toast azul */ }
}

// src/components/Chart.ts
export class Chart {
  constructor(canvasId: string, config: ChartConfig) {}
  update(newData: ChartDataset[]) { /* atualiza gráfico */ }
  destroy() { /* limpa Chart.js */ }
}
```

**Características:**
- Sem dependência de Services
- Totalmente testável
- Reutilizável em múltiplos módulos
- Props-based (dados como entrada)

---

### Services Layer ⭐
**Responsabilidade**: Lógica de negócio + chamadas a Supabase

```typescript
// src/services/crm.ts
export const crmService = {
  
  /**
   * Criar novo cliente
   * @param cliente - Dados do cliente
   * @throws Error se falhar
   */
  async createClient(cliente: Omit<Cliente, 'id' | 'created_at'>) {
    // 1. Validar entrada
    if (!cliente.nome) throw new Error('Nome obrigatório');
    
    // 2. Chamar Supabase
    const { data, error } = await sb
      .from('clientes_ravo')
      .insert([cliente])
      .select()
      .single();
    
    // 3. Tratar erro
    if (error) {
      logger.error('createClient', error);
      throw error;
    }
    
    // 4. Atualizar cache local
    clientCache.push(data);
    
    // 5. Retornar
    return data;
  },
  
  /**
   * Listar todos os clientes
   */
  async getClients(filters?: { fase?: ClientePhase }) {
    let query = sb.from('clientes_ravo').select('*');
    if (filters?.fase) {
      query = query.eq('fase', filters.fase);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  /**
   * Atualizar cliente existente
   */
  async updateClient(id: string, updates: Partial<Cliente>) {
    // Validar apenas campos que podem ser atualizados
    const allowed = ['fase', 'valor_mensal', 'invest_trafego', 'notas'];
    const validated = Object.keys(updates)
      .filter(k => allowed.includes(k))
      .reduce((acc, k) => ({ ...acc, [k]: updates[k] }), {});
    
    const { data, error } = await sb
      .from('clientes_ravo')
      .update(validated)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidar cache
    clientCache = clientCache.map(c => c.id === id ? data : c);
    
    return data;
  },
  
  /**
   * Deletar cliente
   */
  async deleteClient(id: string) {
    const { error } = await sb
      .from('clientes_ravo')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    clientCache = clientCache.filter(c => c.id !== id);
  }
};
```

**Princípios:**
- **CRUD puro**: Create, Read, Update, Delete
- **Validação**: Apenas dados válidos chegam a Supabase
- **Cache**: Reduz chamadas desnecessárias
- **Error handling**: Sempre lança erros descritivos
- **Logging**: Tudo registrado para debug

**Serviços disponíveis:**
- `authService` — Login/logout/session
- `crmService` — Clientes + leads
- `financeService` — Receita/despesa
- `goalsService` — CRUD de metas
- `csService` — Touchpoints + health score

---

### Data Persistence Layer
**Tecnologia**: Supabase (PostgreSQL + Realtime)

#### Tabelas Principais

**clientes_ravo**
```sql
CREATE TABLE clientes_ravo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  empresa VARCHAR(255) NOT NULL,
  segmento VARCHAR(100),
  valor_mensal DECIMAL(12, 2) DEFAULT 0,
  invest_trafego DECIMAL(12, 2) DEFAULT 0,
  data_entrada DATE,
  responsavel VARCHAR(100),
  fase VARCHAR(50) CHECK (fase IN ('onboarding', 'ativo', 'risco', 'pausado', 'estorno')),
  nps VARCHAR(50),
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_mrr CHECK (valor_mensal >= 0)
);

CREATE INDEX idx_cliente_fase ON clientes_ravo(fase);
CREATE INDEX idx_cliente_responsavel ON clientes_ravo(responsavel);
```

**pipeline_ravo**
```sql
CREATE TABLE pipeline_ravo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  empresa VARCHAR(255) NOT NULL,
  segmento VARCHAR(100),
  email VARCHAR(255),
  telefone VARCHAR(20),
  ticket DECIMAL(12, 2),
  etapa VARCHAR(50) CHECK (etapa IN ('contatado', 'qualificado', 'reuniao', 'proposta', 'fechado', 'perdido')),
  origem VARCHAR(50),
  responsavel VARCHAR(100),
  data_follow_up DATE,
  ultima_atividade TIMESTAMP,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pipeline_etapa ON pipeline_ravo(etapa);
CREATE INDEX idx_pipeline_responsavel ON pipeline_ravo(responsavel);
```

#### Row Level Security (RLS)

```sql
-- Apenas usuários autenticados podem ler
ALTER TABLE clientes_ravo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ler clientes"
  ON clientes_ravo FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admin pode deletar"
  ON clientes_ravo FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
```

#### Real-time Subscriptions

```typescript
// src/services/supabase.ts
export const subscribeToClients = (callback: (payload: any) => void) => {
  return sb
    .channel('public:clientes_ravo')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'clientes_ravo' },
      (payload) => callback(payload)
    )
    .subscribe();
};
```

---

## 🔄 Fluxo de Dados

### Criar Cliente (Exemplo Completo)

```
1. Usuário preenche formulário no módulo CRM
   └─ event: form.submit

2. CRM Module valida input localmente
   ├─ Verifica campos obrigatórios
   └─ Se inválido: mostra Toast.error()

3. CRM Module chama crmService.createClient(dados)
   └─ Service valida novamente (server-side validation)
   └─ Chama sb.from('clientes_ravo').insert()

4. Supabase:
   ├─ Checa RLS (usuário tem permissão?)
   ├─ Valida constraints (valor_mensal >= 0?)
   ├─ Insere na tabela
   └─ Retorna dados completos (com ID, timestamps)

5. Service atualiza cache local
   └─ clientCache.push(novoCliente)

6. Service retorna sucesso para CRM Module
   └─ Module re-renderiza grid de clientes

7. Supabase envia evento real-time
   └─ Qualquer outra aba/usuário recebe atualização automática

8. UI mostra Toast.success("Cliente criado!")
```

**Diagrama em sequência:**

```
User UI    Module      Service     Supabase
  │          │            │           │
  ├─submit──>│            │           │
  │          ├─validate──>│           │
  │          │<─ok────────│           │
  │          ├─create────────────────>│
  │          │            │           ├─check RLS
  │          │            │           ├─validate
  │          │            │           └─insert
  │          │<─success──────────────┤
  │<─success─┤            │           │
  │          ├─cache-update          │
  │          └────────────────────────├─publish event
  │          ◄─real-time update───────┤
```

---

## 🗄️ Padrões de Código

### Validação

```typescript
// src/utils/validate.ts
export const validators = {
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Email inválido',
  
  numero: (min = 0, max = Infinity) => (v: number) =>
    v >= min && v <= max ? null : `Deve estar entre ${min} e ${max}`,
  
  naoVazio: (v: string) => v?.trim().length > 0 ? null : 'Campo obrigatório',
  
  data: (v: string) => {
    const d = new Date(v);
    return !isNaN(d.getTime()) ? null : 'Data inválida';
  }
};

// Uso em Service
export const crmService = {
  async createClient(cliente) {
    // Validar cada campo
    if (validators.naoVazio(cliente.nome)) throw new Error('Nome obrigatório');
    if (validators.email(cliente.email)) throw new Error('Email inválido');
    if (validators.numero(0, 99999)(cliente.valor_mensal)) throw new Error('Valor inválido');
    
    // Se passou: salvar
    return sb.from('clientes_ravo').insert([cliente]);
  }
};
```

### Tratamento de Erro

```typescript
// Erro esperado (validação)
throw new ValidationError('Email já existe', { field: 'email' });

// Erro de rede
throw new NetworkError('Falha ao conectar com Supabase', { retry: true });

// Erro desconhecido (log + notificar usuário)
try {
  await crmService.createClient(data);
} catch (error) {
  if (error instanceof ValidationError) {
    Toast.error(error.message);
  } else if (error instanceof NetworkError) {
    Toast.error('Sem conexão. Tente novamente.');
  } else {
    logger.error('Erro desconhecido:', error);
    Toast.error('Algo deu errado. Tente novamente.');
  }
}
```

### Async/Await Pattern

```typescript
// ❌ BAD: Callback hell
crmService.getClients((clients) => {
  financService.getFinance((finance) => {
    // Pyramid of doom
  });
});

// ✅ GOOD: async/await
try {
  const clients = await crmService.getClients();
  const finance = await financeService.getFinance();
  // Processamento limpo
} catch (error) {
  handleError(error);
}

// ✅ GOOD: Promise.all (paralelo)
try {
  const [clients, finance, goals] = await Promise.all([
    crmService.getClients(),
    financeService.getFinance(),
    goalsService.getGoals()
  ]);
} catch (error) {
  handleError(error);
}
```

### Cache Pattern

```typescript
// src/services/cache.ts
class CacheService {
  private cache = new Map<string, any>();
  private ttl = new Map<string, number>();
  
  set(key: string, value: any, ttlMs = 5 * 60 * 1000) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
    
    // Auto-expire
    setTimeout(() => this.cache.delete(key), ttlMs);
  }
  
  get(key: string) {
    if (!this.cache.has(key)) return null;
    
    const expireTime = this.ttl.get(key);
    if (expireTime && Date.now() > expireTime) {
      this.cache.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }
  
  clear(key?: string) {
    key ? this.cache.delete(key) : this.cache.clear();
  }
}

// Uso
export const crmService = {
  async getClients() {
    // Verificar cache primeiro
    const cached = cache.get('clients');
    if (cached) return cached;
    
    // Se não tem cache, buscar de Supabase
    const data = await sb.from('clientes_ravo').select('*');
    
    // Guardar em cache por 5 minutos
    cache.set('clients', data, 5 * 60 * 1000);
    
    return data;
  }
};
```

---

## 🧪 Testes

### Teste Unitário (Service)

```typescript
// src/__tests__/services/crm.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { crmService } from '../../services/crm';

describe('CRM Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('deve criar cliente com dados válidos', async () => {
    const novoCliente = {
      nome: 'Hospital X',
      empresa: 'Hospital X',
      segmento: 'Saúde'
    };
    
    const resultado = await crmService.createClient(novoCliente);
    
    expect(resultado).toBeDefined();
    expect(resultado.id).toBeDefined();
    expect(resultado.nome).toBe('Hospital X');
  });
  
  it('deve lançar erro se nome vazio', async () => {
    const clienteInvalido = {
      nome: '',
      empresa: 'X',
      segmento: 'Y'
    };
    
    await expect(
      crmService.createClient(clienteInvalido)
    ).rejects.toThrow('Nome obrigatório');
  });
});
```

### Teste de Componente

```typescript
// src/__tests__/components/Modal.test.ts
import { describe, it, expect } from 'vitest';
import { Modal } from '../../components/Modal';

describe('Modal Component', () => {
  it('deve renderizar quando aberto', () => {
    const modal = new Modal({ titulo: 'Test Modal' });
    modal.open();
    
    const element = document.querySelector('[data-testid="modal"]');
    expect(element).toBeVisible();
  });
  
  it('deve fechar quando clicar em X', () => {
    const modal = new Modal({ titulo: 'Test Modal' });
    modal.open();
    
    const closeBtn = document.querySelector('[data-testid="modal-close"]');
    closeBtn?.click();
    
    const element = document.querySelector('[data-testid="modal"]');
    expect(element).not.toBeVisible();
  });
});
```

---

## 📊 Performance & Otimizações

### Lazy Loading de Módulos

```typescript
// src/main.ts
const MODULES = {
  dashboard: () => import('./modules/dashboard'),
  crm: () => import('./modules/crm'),
  finance: () => import('./modules/finance')
};

async function loadModule(name: string) {
  const module = await MODULES[name]();
  return module.default;
}
```

### Code Splitting

```typescript
// Vite automaticamente faz code splitting
// build output:
// - index.js (core: ~50KB)
// - dashboard-xyz.js (~30KB)
// - crm-abc.js (~25KB)
// Carregados apenas quando necessário
```

### Caching Estratégico

```typescript
// 1. HTTP Cache Headers
Response.headers['Cache-Control'] = 'public, max-age=3600';

// 2. Service Worker Cache
// 3. Local Storage (para offline)
// 4. Memory Cache (dados frequentes)
```

---

## 🔒 Segurança

### OWASP Top 10 Mitigações

| Risco | Mitigação |
|-------|-----------|
| Injection | Supabase parameterized queries |
| Auth | Supabase Auth + RLS |
| Sensitive Data | HTTPS only + encryption at rest |
| XXS | Sanitization + CSP headers |
| CSRF | CORS + SameSite cookies |
| Misconfig | Environment variables |
| Vulnerable Deps | npm audit, dependabot |
| Broken Auth | Session timeout, 2FA |
| Vulnerable APIs | Input validation + rate limiting |
| Logging | Audit trails |

### Exemplo: Validação + RLS

```sql
-- RLS: Apenas dono pode ver dados
CREATE POLICY "owner_access"
  ON clientes_ravo FOR ALL
  USING (user_id = auth.uid());

-- Constraint: Valor não pode ser negativo
ALTER TABLE clientes_ravo
  ADD CONSTRAINT check_valor CHECK (valor_mensal >= 0);
```

---

## 📈 Roadmap Arquitetural

### Phase 1 ✅ (Semanas 1-2)
- [x] Modularização básica
- [x] TypeScript setup
- [x] Services layer
- [x] Component framework

### Phase 2 (Semanas 3-4)
- [ ] State management (Redux-like)
- [ ] PWA support
- [ ] Offline mode
- [ ] Real-time subscriptions

### Phase 3 (Semanas 5-6)
- [ ] Advanced analytics
- [ ] AI-powered insights
- [ ] Export features (PDF/Excel)
- [ ] Mobile app (React Native)

### Phase 4+ (Futuro)
- [ ] Multi-tenant
- [ ] White-label
- [ ] Webhook integrations
- [ ] Custom data models

---

## 🔗 Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

---

**Última atualização**: 3 de Julho de 2026  
**Status**: Production Ready ✅
