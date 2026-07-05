/**
 * RAVO OS — Home Page (Beautiful Design)
 * Dashboard principal com design moderno
 */

import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';

export default function HomePage() {
  const modules = [
    {
      title: 'CRM',
      description: 'Gerenciar leads e clientes',
      icon: '👥',
      href: '/crm',
      gradient: 'from-blue-500 to-blue-600',
      stats: '0 Leads',
    },
    {
      title: 'Finance',
      description: 'Visualizar transações',
      icon: '💰',
      href: '/finance',
      gradient: 'from-green-500 to-green-600',
      stats: '$0.00',
    },
    {
      title: 'Goals',
      description: 'Acompanhar KPIs',
      icon: '🎯',
      href: '/goals',
      gradient: 'from-purple-500 to-purple-600',
      stats: '0%',
    },
    {
      title: 'Customer Success',
      description: 'Gerenciar clientes',
      icon: '⭐',
      href: '/cs',
      gradient: 'from-orange-500 to-orange-600',
      stats: '0 Tickets',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                R
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RAVO OS</h1>
                <p className="text-xs text-gray-500">v2.0 Production</p>
              </div>
            </div>
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Central de Operações Estratégicas
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Gerencie seus leads, finanças, metas e relacionamento com clientes em uma plataforma única e poderosa.
          </p>
          <Link to="/login">
            <Button variant="primary" size="lg">
              Começar Agora
            </Button>
          </Link>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {modules.map((module) => (
            <Link key={module.title} to={module.href}>
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                {/* Gradient Header */}
                <div className={`bg-gradient-to-br ${module.gradient} p-8 text-white`}>
                  <div className="text-5xl mb-4">{module.icon}</div>
                  <h3 className="text-2xl font-bold">{module.title}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {module.stats}
                    </span>
                    <span className="text-blue-600 font-semibold text-sm">→</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="p-8">
            <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600">Leads Ativos</div>
            <div className="text-xs text-gray-400 mt-2">Crescimento +0%</div>
          </Card>
          <Card className="p-8">
            <div className="text-4xl font-bold text-green-600 mb-2">$0.00</div>
            <div className="text-gray-600">Revenue Total</div>
            <div className="text-xs text-gray-400 mt-2">Este mês</div>
          </Card>
          <Card className="p-8">
            <div className="text-4xl font-bold text-purple-600 mb-2">0%</div>
            <div className="text-gray-600">Progresso Geral</div>
            <div className="text-xs text-gray-400 mt-2">Das metas</div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-lg mb-8 opacity-90">
            Crie sua conta e acesse todos os módulos em segundos.
          </p>
          <Link to="/signup">
            <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 text-sm">
          <p>
            RAVO OS v2.0 — Central de Operações Estratégicas
            <br />
            Desenvolvido com ❤️ em TypeScript + React
          </p>
        </div>
      </footer>
    </div>
  );
}
