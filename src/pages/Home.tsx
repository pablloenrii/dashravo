/**
 * RAVO OS — Home Page (Premium Design v2.0)
 * Central de Operações Estratégicas — Enterprise Grade
 */

import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';

export default function HomePage() {
  const modules = [
    {
      title: 'CRM',
      description: 'Gerenciamento de leads e relacionamento com clientes',
      icon: '👥',
      href: '/crm',
      color: 'blue',
      stats: { value: '0', label: 'Leads Ativos' },
    },
    {
      title: 'Finance',
      description: 'Gestão financeira e análise de receitas',
      icon: '💰',
      href: '/finance',
      color: 'green',
      stats: { value: '$0.00', label: 'Revenue Mensal' },
    },
    {
      title: 'Goals',
      description: 'Planejamento estratégico e KPIs',
      icon: '🎯',
      href: '/goals',
      color: 'purple',
      stats: { value: '0%', label: 'Progresso Geral' },
    },
    {
      title: 'Customer Success',
      description: 'Suporte e sucesso do cliente',
      icon: '⭐',
      href: '/cs',
      color: 'orange',
      stats: { value: '0', label: 'Tickets Abertos' },
    },
  ];

  const getGradient = (color: string) => {
    const gradients: Record<string, string> = {
      blue: 'from-blue-600 to-blue-700',
      green: 'from-green-600 to-green-700',
      purple: 'from-purple-600 to-purple-700',
      orange: 'from-orange-500 to-orange-600',
    };
    return gradients[color] || gradients.blue;
  };

  const stats = [
    { label: 'Leads Convertidos', value: '0', change: '+0%', icon: '📈' },
    { label: 'Revenue Gerado', value: '$0.00', change: '+0%', icon: '💵' },
    { label: 'Taxa Sucesso', value: '0%', change: '+0%', icon: '✨' },
  ];

  return (
    <div className="page-container">
      {/* Header Premium */}
      <header className="header-section">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              R
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RAVO OS</h1>
              <p className="text-xs text-gray-500 font-medium">Strategic Operations Center</p>
            </div>
          </div>

          <Link to="/login">
            <button className="btn-secondary">
              Acessar Sistema
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-24 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6">
            ✨ Plataforma de Operações Integrada
          </span>

          <h2 className="text-h1 mb-6 text-gray-900">
            Centralize suas operações<br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              em uma plataforma poderosa
            </span>
          </h2>

          <p className="text-subtitle max-w-3xl mx-auto mb-10 text-gray-600">
            Gerencie leads, finanças, metas e sucesso do cliente em um só lugar.
            Projetado para empresas que crescem rápido e precisam de eficiência operacional.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login">
              <button className="btn-primary text-lg">
                Começar Agora →
              </button>
            </Link>
            <Link to="/signup">
              <button className="btn-secondary text-lg">
                Criar Conta
              </button>
            </Link>
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid-layout mb-28">
          {modules.map((module) => (
            <Link key={module.title} to={module.href}>
              <div className="card-premium overflow-hidden h-full cursor-pointer group">
                {/* Top Accent Bar */}
                <div className={`h-1 bg-gradient-to-r ${getGradient(module.color)}`} />

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-4xl mb-3">{module.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getGradient(module.color)} opacity-10`} />
                  </div>

                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {module.description}
                  </p>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {module.stats.value}
                        </div>
                        <div className="text-xs text-gray-500">{module.stats.label}</div>
                      </div>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getGradient(module.color)} flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                        →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <section className="mb-28">
          <h3 className="text-h3 text-gray-900 mb-12 text-center">
            Métricas em Tempo Real
          </h3>

          <div className="grid-layout-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="card-premium p-8 text-center animate-slide-in">
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium mb-3">{stat.label}</div>
                <div className="text-xs font-semibold text-green-600">
                  {stat.change} este período
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-28">
          <h3 className="text-h3 text-gray-900 mb-12 text-center">
            Funcionalidades Principais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Pipeline Inteligente', desc: 'Acompanhe leads através de cada estágio do funil' },
              { title: 'Análises Financeiras', desc: 'Relatórios detalhados de receita e despesas' },
              { title: 'Metas Estratégicas', desc: 'Defina KPIs e acompanhe progresso em tempo real' },
              { title: 'Suporte Premium', desc: 'Gerencie tickets de clientes com eficiência' },
            ].map((feature, idx) => (
              <div key={idx} className="card-premium p-8">
                <h4 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-16 text-white text-center shadow-xl shadow-blue-200 mb-20 animate-slide-in-up">
          <h3 className="text-4xl font-bold mb-6">Pronto para transformar suas operações?</h3>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Junte-se a empresas que já estão usando RAVO OS para crescer 10x mais rápido.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup">
              <button className="px-8 py-3 bg-white text-blue-700 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl">
                Começar Grátis
              </button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all">
              Agendar Demo
            </button>
          </div>
        </section>
      </section>

      {/* Footer Professional */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">RAVO OS</h4>
              <p className="text-sm text-gray-600">Plataforma completa de operações estratégicas.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">CRM</a></li>
                <li><a href="#" className="hover:text-blue-600">Finance</a></li>
                <li><a href="#" className="hover:text-blue-600">Goals</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Documentação</a></li>
                <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Sobre</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-600">
            <p>© 2024 RAVO OS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
