import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Target, TrendingUp, Phone, Plus, MoreVertical, Mail } from 'lucide-react';
import { KPICardMinimal } from '@/components/KPICardMinimal';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { Dropdown } from '@/components/Dropdown';
import { Table, TableColumn } from '@/components/Table';
import { ChartTooltip } from '@/components/ChartTooltip';
import { colorSystem } from '@/styles/color-system';
import { colorSystemPremium } from '@/styles/color-system-premium';

const dadosContatos = [
  { mês: 'Jan', novos: 45, ativos: 234 },
  { mês: 'Fev', novos: 52, ativos: 248 },
  { mês: 'Mar', novos: 38, ativos: 256 },
  { mês: 'Abr', novos: 61, ativos: 275 },
  { mês: 'Mai', novos: 55, ativos: 298 },
  { mês: 'Jun', novos: 73, ativos: 320 },
];

const dadosOportunidades = [
  { estágio: 'Identificadas', quantidade: 450, fill: colorSystem.pipeline.primary },
  { estágio: 'Em Andamento', quantidade: 240, fill: colorSystem.automation.primary },
  { estágio: 'Propostas', quantidade: 120, fill: colorSystem.revenue.primary },
  { estágio: 'Ganhas', quantidade: 85, fill: colorSystem.success },
];

const contatos = [
  { id: 1, nome: 'João Silva', empresa: 'Acme Corp', etapa: 'Qualificado', valor: 45000 },
  { id: 2, nome: 'Maria Santos', empresa: 'TechStart', etapa: 'Proposta', valor: 28000 },
  { id: 3, nome: 'Pedro Costa', empresa: 'WebFlow', etapa: 'Contatado', valor: 12000 },
  { id: 4, nome: 'Ana Oliveira', empresa: 'CloudSys', etapa: 'Qualificado', valor: 56000 },
  { id: 5, nome: 'Carlos Mendes', empresa: 'DataCore', etapa: 'Identificado', valor: 15000 },
  { id: 6, nome: 'Lucia Ferreira', empresa: 'SoftWare Inc', etapa: 'Qualificado', valor: 72000 },
  { id: 7, nome: 'Marco Rossi', empresa: 'Tech Solutions', etapa: 'Proposta', valor: 38000 },
  { id: 8, nome: 'Beatriz Lima', empresa: 'Web Innovations', etapa: 'Fechado', valor: 95000 },
];

export function CRMPage() {
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [newContact, setNewContact] = useState({ nome: '', email: '', empresa: '' });

  const handleCreateContact = () => {
    if (newContact.nome && newContact.email) {
      setShowAlert(true);
      setShowModal(false);
      setNewContact({ nome: '', email: '', empresa: '' });
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Alert */}
      {showAlert && (
        <div style={{ marginBottom: '16px' }}>
          <Alert
            type="success"
            title="Sucesso!"
            message="Novo contato criado com sucesso"
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}

      {/* Modal - Novo Contato */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Contato"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateContact}
              disabled={!newContact.nome || !newContact.email}
            >
              Criar Contato
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Nome"
            placeholder="João Silva"
            value={newContact.nome}
            onChange={(e) => setNewContact({ ...newContact, nome: e.target.value })}
            icon={<Users size={16} />}
          />
          <Input
            label="Email"
            type="email"
            placeholder="joao@example.com"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            icon={<Mail size={16} />}
          />
          <Input
            label="Empresa"
            placeholder="Acme Corp"
            value={newContact.empresa}
            onChange={(e) => setNewContact({ ...newContact, empresa: e.target.value })}
          />
        </div>
      </Modal>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F5F5F7', margin: 0 }}>
              CRM - Gestão de Relacionamento
            </h1>
            <Badge variant="info">CLIENTES</Badge>
          </div>
          <p style={{ fontSize: '12px', color: '#A1A1A6', margin: 0 }}>
            Controle de contatos, oportunidades e relacionamentos
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Plus size={16} />
          Novo Contato
        </Button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        <KPICardMinimal title="Total de Contatos" value="320" unit="ativos" icon={<Users />} color={colorSystem.customers.primary} trend={{ direction: 'up', percentage: 8 }} />
        <KPICardMinimal title="Oportunidades" value="895" unit="em aberto" icon={<Target />} color={colorSystem.pipeline.primary} trend={{ direction: 'up', percentage: 15 }} />
        <KPICardMinimal title="Taxa de Conversão" value="18.9%" unit="este mês" icon={<TrendingUp />} color={colorSystem.conversion.primary} trend={{ direction: 'up', percentage: 3 }} />
        <KPICardMinimal title="Valor em Pipeline" value="R$ 892K" unit="total" icon={<Phone />} color={colorSystem.revenue.primary} trend={{ direction: 'up', percentage: 22 }} />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Novos Contatos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosContatos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mês" stroke="#86868B" style={{ fontSize: '11px' }} />
              <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Line type="monotone" dataKey="novos" stroke={colorSystem.customers.primary} dot={false} />
              <Line type="monotone" dataKey="ativos" stroke={colorSystem.pipeline.primary} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Oportunidades por Estágio</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={dadosOportunidades} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="quantidade">
                {dadosOportunidades.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Premium */}
      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#EBEBF0', margin: '0 0 12px 0' }}>
          Contatos Principais
        </h3>
        <Table<typeof contatos[0]>
          columns={[
            {
              key: 'nome',
              label: 'Nome',
              sortable: true,
              width: '22%',
            },
            {
              key: 'empresa',
              label: 'Empresa',
              sortable: true,
              width: '22%',
            },
            {
              key: 'etapa',
              label: 'Etapa',
              sortable: true,
              width: '18%',
              render: (value) => (
                <Badge variant={
                  value === 'Qualificado' ? 'success' :
                  value === 'Proposta' ? 'warning' :
                  value === 'Fechado' ? 'success' :
                  'default'
                }>
                  {value}
                </Badge>
              ),
            },
            {
              key: 'valor',
              label: 'Valor',
              sortable: true,
              align: 'right',
              width: '18%',
              render: (value) => (
                <span style={{ color: colorSystemPremium.data.orange, fontWeight: '600' }}>
                  R$ {(value / 1000).toFixed(0)}K
                </span>
              ),
            },
            {
              key: 'id',
              label: 'Ações',
              align: 'center',
              width: '20%',
              render: () => (
                <Dropdown
                  trigger={
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 200ms',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#EA6A1B'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                    >
                      <MoreVertical size={16} />
                    </button>
                  }
                  items={[
                    { id: '1', label: 'Editar', onClick: () => alert('Editar contato') },
                    { id: '2', label: 'Enviar Email', onClick: () => alert('Email enviado') },
                    { id: '3', divider: true },
                    { id: '4', label: 'Deletar', onClick: () => alert('Contato deletado') },
                  ]}
                  align="right"
                />
              ),
            },
          ]}
          data={contatos}
          selectable={true}
          paginated={true}
          pageSize={5}
          hoverable={true}
          striped={true}
        />
      </div>
    </div>
  );
}

export default CRMPage;
