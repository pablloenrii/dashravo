import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div>
      {/* Tab List */}
      <div
        style={{
          display: 'flex',
          borderBottom: '0.5px solid rgba(255,255,255,0.04)',
          gap: '0',
          overflow: 'auto',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              flex: '0 0 auto',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '600' : '500',
              color: activeTab === tab.id ? '#EA6A1B' : '#9CA3AF',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 300ms ease-out',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#EBEBF0';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#9CA3AF';
              }
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {activeTab === tab.id && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-0.5px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #EA6A1B 0%, #F77E2D 100%)',
                  animation: 'slideInTab 300ms ease-out',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tabs.map((tab) => (
        activeTab === tab.id && (
          <div
            key={tab.id}
            style={{
              padding: '16px 0',
              animation: 'fadeIn 200ms ease-out',
            }}
          >
            {tab.content}
          </div>
        )
      ))}

      <style>{`
        @keyframes slideInTab {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
