-- ============================================================================
-- RAVO OS — Seed de demonstração (software house)
-- ============================================================================
-- Dados fictícios coerentes: 6 meses de operação, 4 streams de receita,
-- projetos com margens boas e ruins (para o dashboard ter o que sinalizar).
-- Reaplicável: limpa as tabelas antes de inserir.
-- ============================================================================

BEGIN;

TRUNCATE public.apontamentos, public.faturas, public.projetos, public.contratos,
         public.oportunidades, public.despesas, public.clientes, public.pessoas
         RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- Time
-- ---------------------------------------------------------------------------
INSERT INTO public.pessoas (nome, papel, custo_hora, rate_hora, horas_semana) VALUES
  ('Pablo Henrique',   'Sócio / Estratégia', 120, 320, 30),
  ('Douglas Costa',    'Gestor de Tráfego',   55, 180, 40),
  ('Lynnda Ferreira',  'SDR',                 38,   0, 40),
  ('Rafael Souza',     'Desenvolvedor Full',  75, 210, 40),
  ('Marina Alves',     'Designer / UX',       58, 170, 40);

-- ---------------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------------
INSERT INTO public.clientes (nome, segmento, origem, status, cliente_desde) VALUES
  ('Thiago Carvalho Advocacia', 'Advocacia',        'Indicação', 'ativo', CURRENT_DATE - 400),
  ('Hospital Reviva',           'Saúde',            'Outbound',  'ativo', CURRENT_DATE - 300),
  ('Terra Azul Construções',    'Construção Civil', 'Indicação', 'ativo', CURRENT_DATE - 240),
  ('Vilela Turismo',            'Turismo',          'Ads',       'ativo', CURRENT_DATE - 180),
  ('Leonardo Peruci Imóveis',   'Imobiliário',      'Indicação', 'ativo', CURRENT_DATE - 150),
  ('100% Caipira',              'Varejo',           'Ads',       'churn', CURRENT_DATE - 420);

-- ---------------------------------------------------------------------------
-- Contratos — os 4 streams
-- ---------------------------------------------------------------------------
INSERT INTO public.contratos (cliente_id, nome, tipo, valor_mensal, valor_total, valor_hora, data_inicio, data_fim, status) VALUES
  -- Retainers (receita previsível)
  (1, 'Gestão de Tráfego + Automação',  'retainer', 8500,  NULL, NULL, CURRENT_DATE - 400, NULL,              'ativo'),
  (2, 'Performance Marketing',          'retainer', 12000, NULL, NULL, CURRENT_DATE - 300, CURRENT_DATE + 180,'ativo'),
  (4, 'Gestão de Mídia',                'retainer', 4500,  NULL, NULL, CURRENT_DATE - 180, NULL,              'ativo'),
  (6, 'Sinalização Digital',            'retainer', 2800,  NULL, NULL, CURRENT_DATE - 420, CURRENT_DATE - 60, 'cancelado'),

  -- Projetos (escopo fechado)
  (3, 'Sistema de Ponto Multi-obra',    'projeto',  NULL, 68000, NULL, CURRENT_DATE - 150, NULL,              'ativo'),
  (5, 'Identidade + Landing Pages',     'projeto',  NULL, 18500, NULL, CURRENT_DATE - 120, NULL,              'concluido'),
  (2, 'Portal do Paciente',             'projeto',  NULL, 42000, NULL, CURRENT_DATE - 90,  NULL,              'ativo'),

  -- Body shop (hora)
  (3, 'Alocação Dev Sênior',            'hora',     NULL, NULL,  195,  CURRENT_DATE - 90,  NULL,              'ativo'),

  -- Licença SaaS próprio
  (1, 'RAVO Juris — Licença',           'licenca',  1990, NULL, NULL, CURRENT_DATE - 200, NULL,              'ativo');

-- ---------------------------------------------------------------------------
-- Projetos
-- ---------------------------------------------------------------------------
INSERT INTO public.projetos (contrato_id, nome, horas_estimadas, data_inicio, data_prevista, data_entrega, status) VALUES
  (5, 'Ponto Multi-obra — MVP',       420, CURRENT_DATE - 150, CURRENT_DATE + 30, NULL,               'em_andamento'),
  (6, 'Identidade Visual + 3 LPs',    120, CURRENT_DATE - 120, CURRENT_DATE - 60, CURRENT_DATE - 55,  'entregue'),
  (7, 'Portal do Paciente — Fase 1',  260, CURRENT_DATE - 90,  CURRENT_DATE + 60, NULL,               'em_andamento'),
  (8, 'Squad Terra Azul',             160, CURRENT_DATE - 90,  NULL,              NULL,               'em_andamento');

-- ---------------------------------------------------------------------------
-- Faturas — 6 meses de receita
-- ---------------------------------------------------------------------------
-- Retainers e licença: recorrência mensal
INSERT INTO public.faturas (contrato_id, competencia, valor, status)
SELECT c.id,
       (date_trunc('month', CURRENT_DATE) - (g || ' months')::INTERVAL)::DATE,
       c.valor_mensal,
       CASE WHEN g = 0 THEN 'emitida' ELSE 'paga' END
FROM public.contratos c
CROSS JOIN generate_series(0, 5) g
WHERE c.tipo IN ('retainer','licenca')
  AND c.status = 'ativo';

-- Retainer cancelado: só faturou até 2 meses atrás (gera o churn)
INSERT INTO public.faturas (contrato_id, competencia, valor, status)
SELECT c.id,
       (date_trunc('month', CURRENT_DATE) - (g || ' months')::INTERVAL)::DATE,
       c.valor_mensal, 'paga'
FROM public.contratos c
CROSS JOIN generate_series(2, 5) g
WHERE c.nome = 'Sinalização Digital';

-- Projetos: faturamento por marco
INSERT INTO public.faturas (contrato_id, competencia, valor, status) VALUES
  (5, (date_trunc('month', CURRENT_DATE) - INTERVAL '4 months')::DATE, 20400, 'paga'),
  (5, (date_trunc('month', CURRENT_DATE) - INTERVAL '2 months')::DATE, 20400, 'paga'),
  (6, (date_trunc('month', CURRENT_DATE) - INTERVAL '3 months')::DATE,  9250, 'paga'),
  (6, (date_trunc('month', CURRENT_DATE) - INTERVAL '2 months')::DATE,  9250, 'paga'),
  (7, (date_trunc('month', CURRENT_DATE) - INTERVAL '2 months')::DATE, 12600, 'paga'),
  (7, (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' )::DATE, 12600, 'paga');

-- Body shop: horas do mês
INSERT INTO public.faturas (contrato_id, competencia, valor, status) VALUES
  (8, (date_trunc('month', CURRENT_DATE) - INTERVAL '2 months')::DATE, 15600, 'paga'),
  (8, (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' )::DATE, 17550, 'paga'),
  (8,  date_trunc('month', CURRENT_DATE)::DATE,                        11700, 'emitida');

-- ---------------------------------------------------------------------------
-- Apontamentos — horas dos últimos 3 meses
-- ---------------------------------------------------------------------------
-- Projeto 1 (Ponto Multi-obra): estourando escopo de propósito → margem ruim
INSERT INTO public.apontamentos (pessoa_id, projeto_id, contrato_id, data, horas, faturavel, descricao)
SELECT 4, 1, 5,
       (date_trunc('month', CURRENT_DATE) - (g / 22 || ' months')::INTERVAL + (g % 22 || ' days')::INTERVAL)::DATE,
       6.5, TRUE, 'Desenvolvimento backend'
FROM generate_series(0, 65) g;

INSERT INTO public.apontamentos (pessoa_id, projeto_id, contrato_id, data, horas, faturavel, descricao)
SELECT 5, 1, 5,
       (date_trunc('month', CURRENT_DATE) - (g / 15 || ' months')::INTERVAL + (g % 15 || ' days')::INTERVAL)::DATE,
       4.0, TRUE, 'UI do painel de obra'
FROM generate_series(0, 40) g;

-- Projeto 3 (Portal do Paciente): dentro do previsto
INSERT INTO public.apontamentos (pessoa_id, projeto_id, contrato_id, data, horas, faturavel, descricao)
SELECT 4, 3, 7,
       (date_trunc('month', CURRENT_DATE) - (g / 18 || ' months')::INTERVAL + (g % 18 || ' days')::INTERVAL)::DATE,
       5.0, TRUE, 'API e integrações'
FROM generate_series(0, 50) g;

-- Squad body shop
INSERT INTO public.apontamentos (pessoa_id, projeto_id, contrato_id, data, horas, faturavel, descricao)
SELECT 4, 4, 8,
       (date_trunc('month', CURRENT_DATE) - (g / 20 || ' months')::INTERVAL + (g % 20 || ' days')::INTERVAL)::DATE,
       4.0, TRUE, 'Alocação Terra Azul'
FROM generate_series(0, 45) g;

-- Tráfego pago nos retainers
INSERT INTO public.apontamentos (pessoa_id, projeto_id, contrato_id, data, horas, faturavel, descricao)
SELECT 2, NULL, (ARRAY[1,2,3])[1 + (g % 3)],
       (date_trunc('month', CURRENT_DATE) - (g / 30 || ' months')::INTERVAL + (g % 30 || ' days')::INTERVAL)::DATE,
       3.0, TRUE, 'Otimização de campanhas'
FROM generate_series(0, 80) g;

-- Horas não faturáveis: pré-venda, interno, retrabalho
INSERT INTO public.apontamentos (pessoa_id, projeto_id, contrato_id, data, horas, faturavel, descricao)
SELECT (ARRAY[1,3,5])[1 + (g % 3)], NULL, NULL,
       (date_trunc('month', CURRENT_DATE) - (g / 20 || ' months')::INTERVAL + (g % 20 || ' days')::INTERVAL)::DATE,
       3.5, FALSE, 'Pré-venda / interno'
FROM generate_series(0, 55) g;

-- ---------------------------------------------------------------------------
-- Despesas
-- ---------------------------------------------------------------------------
INSERT INTO public.despesas (descricao, categoria, valor, competencia, recorrente)
SELECT d.descricao, d.categoria, d.valor,
       (date_trunc('month', CURRENT_DATE) - (g || ' months')::INTERVAL)::DATE, TRUE
FROM (VALUES
  ('Infraestrutura e VPS',      'Infra',        890),
  ('Ferramentas e SaaS',        'Ferramentas', 2400),
  ('Contabilidade e jurídico',  'Administrativo', 1200),
  ('Mídia paga institucional',  'Marketing',   3500)
) AS d(descricao, categoria, valor)
CROSS JOIN generate_series(0, 5) g;

-- ---------------------------------------------------------------------------
-- Pipeline
-- ---------------------------------------------------------------------------
INSERT INTO public.oportunidades (cliente_id, nome, tipo_receita, valor_estimado, estagio, probabilidade, data_abertura, data_fechamento) VALUES
  (NULL, 'Escritório Menezes — Automação',  'retainer',  9500, 'negociacao',   70, CURRENT_DATE - 38, NULL),
  (NULL, 'Clínica Vitalis — Tráfego',       'retainer',  6800, 'proposta',     45, CURRENT_DATE - 22, NULL),
  (NULL, 'Grupo Andrade — ERP interno',     'projeto',  95000, 'diagnostico',  25, CURRENT_DATE - 15, NULL),
  (NULL, 'Duarte Advogados — RAVO Juris',   'licenca',   1990, 'negociacao',   80, CURRENT_DATE - 10, NULL),
  (NULL, 'Construtora Pinho — Squad',       'hora',     42000, 'qualificacao', 15, CURRENT_DATE - 5,  NULL),
  (3,    'Terra Azul — Fase 2',             'projeto',  38000, 'ganho',       100, CURRENT_DATE - 70, CURRENT_DATE - 40),
  (2,    'Reviva — Portal',                 'projeto',  42000, 'ganho',       100, CURRENT_DATE - 130,CURRENT_DATE - 90),
  (NULL, 'Rede Sabor — E-commerce',         'projeto',  55000, 'perdido',       0, CURRENT_DATE - 110,CURRENT_DATE - 60),
  (NULL, 'Advocacia Lima — Tráfego',        'retainer',  5200, 'perdido',       0, CURRENT_DATE - 95, CURRENT_DATE - 55);

-- Saldo de caixa para o runway
UPDATE public.config SET valor = 185000 WHERE chave = 'saldo_caixa';

COMMIT;
