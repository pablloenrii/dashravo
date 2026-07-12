#!/usr/bin/env python3
"""
Script para inserir dados de teste no Supabase
Obtém automaticamente o primeiro UUID de usuário
"""

import os
import sys
from pathlib import Path

# Ler .env.local
env_file = Path('.env.local')
env_vars = {}

if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()

SUPABASE_URL = env_vars.get('VITE_SUPABASE_URL')
SUPABASE_KEY = env_vars.get('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados')
    sys.exit(1)

print('📋 Conectando ao Supabase...\n')

try:
    import requests
except ImportError:
    print('⚠️  Instalando requests...')
    os.system(f'{sys.executable} -m pip install requests -q')
    import requests

# Obter UUID do primeiro usuário
print('🔍 Obtendo UUID do usuário...')

headers = {
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
}

response = requests.get(
    f'{SUPABASE_URL}/rest/v1/contatos?select=user_id&limit=1',
    headers=headers,
    timeout=10
)

user_id = None

# Tentar obter do auth via função
if response.status_code == 401 or not response.json():
    # Gerar UUID válido para testes
    import uuid
    # Usar um UUID consistente para testes
    user_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    print(f'⚠️  Usando UUID padrão para testes: {user_id}\n')
else:
    try:
        data = response.json()
        if data and len(data) > 0:
            user_id = data[0]['user_id']
            print(f'✓ Usuário encontrado: {user_id}\n')
    except:
        import uuid
        user_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        print(f'⚠️  Usando UUID padrão: {user_id}\n')

if not user_id:
    import uuid
    user_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

print('📊 Inserindo dados de teste...\n')

# Dados a inserir
data_sets = {
    'contatos': [
        {'user_id': user_id, 'nome': 'João Silva', 'empresa': 'Acme Corp', 'email': 'joao@example.com', 'telefone': '11 98765-4321', 'etapa': 'Qualificado', 'valor': 45000},
        {'user_id': user_id, 'nome': 'Maria Santos', 'empresa': 'TechStart', 'email': 'maria@example.com', 'telefone': '21 99876-5432', 'etapa': 'Proposta', 'valor': 28000},
        {'user_id': user_id, 'nome': 'Pedro Costa', 'empresa': 'WebFlow', 'email': 'pedro@example.com', 'telefone': '85 98765-1234', 'etapa': 'Contatado', 'valor': 12000},
        {'user_id': user_id, 'nome': 'Ana Oliveira', 'empresa': 'CloudSys', 'email': 'ana@example.com', 'telefone': '31 97654-3210', 'etapa': 'Qualificado', 'valor': 56000},
        {'user_id': user_id, 'nome': 'Carlos Mendes', 'empresa': 'DataCore', 'email': 'carlos@example.com', 'telefone': '41 98765-9876', 'etapa': 'Identificado', 'valor': 15000},
        {'user_id': user_id, 'nome': 'Lucia Ferreira', 'empresa': 'SoftWare Inc', 'email': 'lucia@example.com', 'telefone': '51 99876-1234', 'etapa': 'Qualificado', 'valor': 72000},
        {'user_id': user_id, 'nome': 'Marco Rossi', 'empresa': 'Tech Solutions', 'email': 'marco@example.com', 'telefone': '61 98765-5678', 'etapa': 'Proposta', 'valor': 38000},
        {'user_id': user_id, 'nome': 'Beatriz Lima', 'empresa': 'Web Innovations', 'email': 'beatriz@example.com', 'telefone': '71 97654-8765', 'etapa': 'Fechado', 'valor': 95000},
    ],
    'receitas': [
        {'user_id': user_id, 'mes': '2026-02-01', 'receita': 125000, 'despesa': 85000, 'lucro': 40000},
        {'user_id': user_id, 'mes': '2026-03-01', 'receita': 118000, 'despesa': 82000, 'lucro': 36000},
        {'user_id': user_id, 'mes': '2026-04-01', 'receita': 145000, 'despesa': 88000, 'lucro': 57000},
        {'user_id': user_id, 'mes': '2026-05-01', 'receita': 168000, 'despesa': 92000, 'lucro': 76000},
        {'user_id': user_id, 'mes': '2026-06-01', 'receita': 185000, 'despesa': 95000, 'lucro': 90000},
        {'user_id': user_id, 'mes': '2026-07-01', 'receita': 215000, 'despesa': 98000, 'lucro': 117000},
    ],
    'fluxo_caixa': [
        {'user_id': user_id, 'semana': '2026-06-15', 'entradas': 45000, 'saidas': 28000},
        {'user_id': user_id, 'semana': '2026-06-22', 'entradas': 52000, 'saidas': 31000},
        {'user_id': user_id, 'semana': '2026-06-29', 'entradas': 38000, 'saidas': 24000},
        {'user_id': user_id, 'semana': '2026-07-06', 'entradas': 61000, 'saidas': 35000},
    ],
    'despesas': [
        {'user_id': user_id, 'categoria': 'Pessoal', 'valor': 45000, 'mes': '2026-07-01'},
        {'user_id': user_id, 'categoria': 'Infraestrutura', 'valor': 25000, 'mes': '2026-07-01'},
        {'user_id': user_id, 'categoria': 'Marketing', 'valor': 18000, 'mes': '2026-07-01'},
        {'user_id': user_id, 'categoria': 'Outros', 'valor': 12000, 'mes': '2026-07-01'},
    ],
    'metas': [
        {'user_id': user_id, 'nome': 'Faturamento Q2', 'meta': 500000, 'realizado': 485000, 'status': 'no-prazo', 'periodo': 'Q2'},
        {'user_id': user_id, 'nome': 'Novos Clientes', 'meta': 50, 'realizado': 48, 'status': 'no-prazo', 'periodo': 'Mensal'},
        {'user_id': user_id, 'nome': 'Taxa de Retenção', 'meta': 95, 'realizado': 92, 'status': 'no-prazo', 'periodo': 'Mensal'},
        {'user_id': user_id, 'nome': 'NPS Score', 'meta': 80, 'realizado': 75, 'status': 'atencao', 'periodo': 'Mensal'},
        {'user_id': user_id, 'nome': 'Margem Lucro', 'meta': 55, 'realizado': 54, 'status': 'no-prazo', 'periodo': 'Mensal'},
        {'user_id': user_id, 'nome': 'Satisfação Cliente', 'meta': 90, 'realizado': 87, 'status': 'no-prazo', 'periodo': 'Mensal'},
    ],
    'progresso_semanal': [
        {'user_id': user_id, 'semana': '2026-06-15', 'atingido': 15, 'meta': 25},
        {'user_id': user_id, 'semana': '2026-06-22', 'atingido': 28, 'meta': 25},
        {'user_id': user_id, 'semana': '2026-06-29', 'atingido': 31, 'meta': 25},
        {'user_id': user_id, 'semana': '2026-07-06', 'atingido': 38, 'meta': 25},
    ],
    'tickets': [
        {'user_id': user_id, 'ticketId': '#TKT-2451', 'cliente': 'Acme Corp', 'assunto': 'Erro na integração', 'prioridade': 'alta', 'status': 'aberto', 'tempo_resposta': '2h 15m'},
        {'user_id': user_id, 'ticketId': '#TKT-2450', 'cliente': 'TechStart', 'assunto': 'Fatura em duplicata', 'prioridade': 'média', 'status': 'aberto', 'tempo_resposta': '1h 30m'},
        {'user_id': user_id, 'ticketId': '#TKT-2449', 'cliente': 'WebFlow', 'assunto': 'Reset de senha', 'prioridade': 'baixa', 'status': 'resolvido', 'tempo_resposta': '45m'},
        {'user_id': user_id, 'ticketId': '#TKT-2448', 'cliente': 'CloudSys', 'assunto': 'Dúvida sobre recurso', 'prioridade': 'baixa', 'status': 'resolvido', 'tempo_resposta': '1h 10m'},
        {'user_id': user_id, 'ticketId': '#TKT-2447', 'cliente': 'DataCore', 'assunto': 'Upgrade de plano', 'prioridade': 'média', 'status': 'aberto', 'tempo_resposta': '3h 20m'},
        {'user_id': user_id, 'ticketId': '#TKT-2446', 'cliente': 'SoftWare Inc', 'assunto': 'API timeout', 'prioridade': 'alta', 'status': 'aberto', 'tempo_resposta': '1h 45m'},
    ],
    'satisfacao': [
        {'user_id': user_id, 'semana': '2026-06-15', 'nps': 68, 'satisfacao': 85},
        {'user_id': user_id, 'semana': '2026-06-22', 'nps': 72, 'satisfacao': 87},
        {'user_id': user_id, 'semana': '2026-06-29', 'nps': 75, 'satisfacao': 89},
        {'user_id': user_id, 'semana': '2026-07-06', 'nps': 78, 'satisfacao': 91},
    ],
}

total_inserted = 0
failed = False

for table_name, records in data_sets.items():
    print(f'{len(data_sets) - list(data_sets.keys()).index(table_name)}️⃣  Inserindo {table_name}...')

    try:
        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/{table_name}',
            headers=headers,
            json=records,
            timeout=10
        )

        if response.status_code in [200, 201]:
            print(f'   ✓ {len(records)} registros inseridos\n')
            total_inserted += len(records)
        else:
            print(f'   ❌ Erro: {response.status_code} - {response.text}\n')
            failed = True
    except Exception as e:
        print(f'   ❌ Erro: {str(e)}\n')
        failed = True

print('═════════════════════════════════════════')
if not failed:
    print(f'✅ SUCESSO! {total_inserted} registros inseridos')
else:
    print(f'⚠️  Alguns erros ocorreram')
print('═════════════════════════════════════════\n')
print('📊 Resumo:')
print('   • 8 contatos')
print('   • 6 receitas')
print('   • 4 fluxos de caixa')
print('   • 4 despesas')
print('   • 6 metas')
print('   • 4 progresso semanal')
print('   • 6 tickets')
print('   • 4 satisfação')
print('\n💡 Próximo: npm run dev\n')
