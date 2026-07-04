/**
 * RAVO OS — Home Page
 * Página inicial do dashboard
 */

import { Layout, Header } from '@/components/layout';
import { Card, Button } from '@/components/ui';

export default function HomePage() {
  const modules = [
    {
      title: 'CRM',
      description: 'Gerenciar leads e clientes',
      icon: '👥',
      href: '/crm',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Finance',
      description: 'Visualizar transações e relatórios',
      icon: '💰',
      href: '/finance',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Goals',
      description: 'Acompanhar KPIs e metas',
      icon: '🎯',
      href: '/goals',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Customer Success',
      description: 'Gerenciar clientes e tickets',
      icon: '⭐',
      href: '/cs',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <Layout>
      <Header
        title="RAVO OS v2.0"
        subtitle="Central de Operações Estratégicas"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Card key={module.title} className="hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-br ${module.color} p-8 text-white rounded-t-lg`}>
                <div className="text-4xl">{module.icon}</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{module.description}</p>
                <Button
                  variant="primary"
                  className="w-full mt-4"
                  onClick={() => (window.location.href = module.href)}
                >
                  Acessar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-gray-600 text-sm mt-2">Leads Ativos</div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600">$0.00</div>
              <div className="text-gray-600 text-sm mt-2">Revenue Total</div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600">0%</div>
              <div className="text-gray-600 text-sm mt-2">Progresso Geral</div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
