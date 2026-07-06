import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'line' | 'pill' | 'underline';
}

export function Tabs({ tabs, defaultTab, variant = 'underline' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className={`flex gap-1 border-b border-gray-200 ${variant === 'pill' ? 'bg-gray-50 p-1 rounded-lg' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-3 font-medium transition-all duration-300 relative group
              ${activeTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }
              ${variant === 'pill' && activeTab === tab.id ? 'bg-white rounded-lg shadow-sm' : ''}
            `}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </span>
            {variant === 'underline' && activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-slide-in" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-6 animate-fade-in">
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
