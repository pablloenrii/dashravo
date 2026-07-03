/**
 * RAVO OS — Definições de Tipos TypeScript
 * Tipos centralizados para todo o projeto
 */

// ============================================
// AUTENTICAÇÃO
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

// ============================================
// CRM - CLIENTES
// ============================================

export type ClientePhase = 'onboarding' | 'ativo' | 'risco' | 'pausado' | 'estorno';
export type NPSStatus = 'construindo' | 'bom' | 'ruim';

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  segmento: string;
  valor_mensal: number;
  invest_trafego: number;
  data_entrada: string;
  responsavel: string;
  fase: ClientePhase;
  nps: NPSStatus;
  notas: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// CRM - PIPELINE
// ============================================

export type EtapaLead = 'contatado' | 'qualificado' | 'reuniao' | 'proposta' | 'fechado' | 'perdido';
export type OrigemLead = 'Tráfego Pago' | 'Indicação' | 'Orgânico' | 'Outbound' | 'Evento';

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  segmento: string;
  email?: string;
  telefone?: string;
  ticket: number;
  etapa: EtapaLead;
  origem: OrigemLead;
  responsavel: string;
  data_follow_up?: string;
  ultima_atividade?: string;
  notas: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// FINANCEIRO
// ============================================

export type CategoriaGasto = 'Salários' | 'Pró-labore' | 'Ferramentas' | 'Marketing' | 'Outros';

export interface DadosFinanceiro {
  id: string;
  mes: string; // 'Jan', 'Fev', etc
  ano: number; // 2026
  receita: number;
  investimento: number;
  roi: number; // receita / investimento
  created_at: string;
}

export interface Despesa {
  id: string;
  mes: string;
  categoria: CategoriaGasto;
  descricao: string;
  valor: number;
  recorrente: boolean;
  created_at: string;
}

export interface DREMensal {
  mes: string;
  receita: number;
  despesas: number;
  lucro: number;
  margem: number; // percentual
}

// ============================================
// METAS & OKRs
// ============================================

export type MetaPeriodo = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
export type MetaCategoria = 'Empresa' | 'Comercial' | 'Marketing' | 'Operação';

export interface Meta {
  id: string;
  nome: string;
  indicador: string; // 'Receita MRR (R$)', 'Taxa de Conversão (%)', etc
  valor_meta: number;
  valor_atual: number;
  categoria: MetaCategoria;
  periodo: MetaPeriodo;
  data_inicio: string; // YYYY-MM-DD
  data_fim: string; // YYYY-MM-DD
  icone: string; // emoji
  cor: string; // hex color
  descricao: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// CUSTOMER SUCCESS
// ============================================

export type TipoTouchpoint = 'Reunião' | 'Email' | 'WhatsApp' | 'Ligação' | 'QBR' | 'NPS' | 'Relatório' | 'Visita';
export type HealthScoreCategory = 'verde' | 'amarelo' | 'vermelho' | 'critico';

export interface Touchpoint {
  id: string;
  cliente_id: string; // Foreign key → Cliente.empresa ou Cliente.nome
  tipo: TipoTouchpoint;
  descricao: string;
  data: string; // YYYY-MM-DD
  responsavel: string;
  nps_score?: number; // 0-10
  created_at: string;
}

export interface HealthScore {
  cliente_id: string;
  score: number; // 0-100
  categoria: HealthScoreCategory;
  motivo: string; // "ROI alto", "Sem contato", etc
}

// ============================================
// DASHBOARD & MÉTRICAS
// ============================================

export interface DashboardMetrics {
  mrr: number;
  clientesAtivos: number;
  clientesRisco: number;
  leadsEmPipeline: number;
  taxaConversao: number; // percentual
  receita_mes: number;
  margem_lucro: number; // percentual
  arr_projetado: number;
  churn_rate: number; // percentual
}

export interface Alert {
  id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensagem: string;
  acao?: string; // URL ou função
  lido: boolean;
  created_at: string;
}

// ============================================
// COMPONENTES
// ============================================

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'pie' | 'radar';
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ModalConfig {
  titulo: string;
  conteudo: string | HTMLElement;
  actions?: ModalAction[];
  size?: 'small' | 'medium' | 'large'; // default: medium
}

export interface ModalAction {
  label: string;
  callback: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// ============================================
// MODULES
// ============================================

export interface Module {
  name: string;
  init(): Promise<void>;
  render(container: HTMLElement): Promise<void>;
  cleanup(): Promise<void>;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// FORMS
// ============================================

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | null; // null = válido, string = erro
  options?: { label: string; value: any }[];
}

export interface FormValue {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// ============================================
// UTILS
// ============================================

export type SortOrder = 'asc' | 'desc';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => string | HTMLElement;
}

export interface TableConfig<T> {
  columns: TableColumn<T>[];
  data: T[];
  sortBy?: keyof T;
  sortOrder?: SortOrder;
  rowsPerPage?: number;
}
