const standardColors = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  neutral: '#6B7280',
};

interface KanbanCard {
  id: string;
  nome: string;
  empresa: string;
  valor: number;
  etapa: string;
}

interface KanbanBoardProps {
  contatos: KanbanCard[];
}

const stageConfig: Record<string, { color: string; bg: string }> = {
  'Identificado': { color: standardColors.neutral, bg: 'rgba(107, 114, 128, 0.08)' },
  'Contatado': { color: standardColors.primary, bg: 'rgba(59, 130, 246, 0.08)' },
  'Qualificado': { color: standardColors.warning, bg: 'rgba(245, 158, 11, 0.08)' },
  'Proposta': { color: standardColors.warning, bg: 'rgba(245, 158, 11, 0.08)' },
  'Fechado': { color: standardColors.success, bg: 'rgba(16, 185, 129, 0.08)' },
};

// Default config for unknown stages
const defaultStageConfig = { color: standardColors.neutral, bg: 'rgba(107, 114, 128, 0.08)' };

export function KanbanBoard({ contatos }: KanbanBoardProps) {
  const stages = ['Identificado', 'Contatado', 'Qualificado', 'Proposta', 'Fechado'];

  const getContactsByStage = (stage: string) => {
    return contatos.filter(c => c.etapa === stage);
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#EBEBF0', margin: '0 0 16px 0' }}>
        Pipeline de Vendas
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        minHeight: '400px',
        overflowX: 'auto',
        paddingBottom: '12px'
      }}>
        {stages.map((stage) => {
          const stageContacts = getContactsByStage(stage);
          const config = stageConfig[stage] || defaultStageConfig;

          return (
            <div
              key={stage}
              style={{
                background: config.bg,
                border: `1px solid ${config.color}`,
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minHeight: '400px'
              }}
            >
              {/* Column Header */}
              <div style={{ marginBottom: '8px' }}>
                <h4 style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: config.color,
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stage}
                </h4>
                <div style={{
                  fontSize: '11px',
                  color: '#A1A1A6',
                  fontWeight: '500'
                }}>
                  {stageContacts.length} {stageContacts.length === 1 ? 'contato' : 'contatos'}
                </div>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {stageContacts.length > 0 ? (
                  stageContacts.map((contact) => (
                    <div
                      key={contact.id}
                      style={{
                        background: '#0A0E1A',
                        border: `1px solid ${config.color}33`,
                        borderRadius: '6px',
                        padding: '10px',
                        cursor: 'pointer',
                        transition: 'all 200ms',
                        boxShadow: `0 0 0 0 ${config.color}00`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = config.color;
                        e.currentTarget.style.background = '#0F1420';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${config.color}22`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${config.color}33`;
                        e.currentTarget.style.background = '#0A0E1A';
                        e.currentTarget.style.boxShadow = `0 0 0 0 ${config.color}00`;
                      }}
                    >
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#F5F5F7',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {contact.nome}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#A1A1A6',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {contact.empresa}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: config.color,
                        paddingTop: '6px',
                        borderTop: `1px solid ${config.color}22`
                      }}>
                        R$ {(contact.valor / 1000).toFixed(0)}K
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#6B7280',
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    Sem contatos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
