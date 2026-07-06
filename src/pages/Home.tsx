/**
 * RAVO OS — Home Page (Enterprise Dashboard)
 * Painel executivo profissional
 */

import { Link } from 'react-router-dom';
import { StatsCard } from '@/components/StatsCard';
import { Tabs } from '@/components/ui/Tabs';

export default function HomePage() {
  const stats = [
    { title: 'Total Leads', value: '1,240', icon: '👥', color: 'blue' as const, trend: { direction: 'up' as const, percentage: 12 } },
    { title: 'Revenue', value: '$24,560', icon: '💰', color: 'green' as const, trend: { direction: 'up' as const, percentage: 8 } },
    { title: 'Conversion Rate', value: '3.2%', icon: '📈', color: 'purple' as const, trend: { direction: 'down' as const, percentage: 2 } },
    { title: 'Open Tickets', value: '34', icon: '⭐', color: 'orange' as const, trend: { direction: 'down' as const, percentage: 5 } },
  ];

  const modules = [
    { title: 'CRM', icon: '👥', href: '/crm', description: 'Leads & Customers', color: 'from-blue-600 to-blue-700' },
    { title: 'Finance', icon: '💰', href: '/finance', description: 'Revenue & Expenses', color: 'from-green-600 to-green-700' },
    { title: 'Goals', icon: '🎯', href: '/goals', description: 'KPIs & Strategy', color: 'from-purple-600 to-purple-700' },
    { title: 'CS', icon: '⭐', href: '/cs', description: 'Support & Success', color: 'from-orange-500 to-orange-600' },
  ];

  const activities = [
    { type: 'lead', text: 'Novo lead adicionado', time: '5 min', icon: '📌' },
    { type: 'deal', text: 'Deal fechado com R$ 15.000', time: '2h', icon: '🎉' },
    { type: 'ticket', text: 'Ticket #234 resolvido', time: '4h', icon: '✅' },
    { type: 'goal', text: 'Meta Q1 atingida 85%', time: '1 dia', icon: '🎯' },
  ];

  const recentData = [
    { name: 'João Silva', role: 'Decision Maker', company: 'TechCorp', status: 'Qualified' },
    { name: 'Maria Santos', role: 'Manager', company: 'DataSys', status: 'Contacted' },
    { name: 'Pedro Costa', role: 'CEO', company: 'CloudApp', status: 'Proposal' },
  ];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      content: (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Key Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <StatsCard key={idx} {...stat} />
              ))}
            </div>
          </div>

          {/* Charts & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center text-gray-400">
                📈 Chart placeholder
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sales Pipeline</h3>
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center text-gray-400">
                📊 Chart placeholder
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: '🔔',
      content: (
        <div className="space-y-4">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{activity.text}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time} ago</p>
              </div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">View</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
              R
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">RAVO OS</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Dashboard</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              📋 Docs
            </button>
            <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
              Access System
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Centralize suas<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              operações estratégicas
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Plataforma empresarial completa para gerenciar leads, finanças, metas e sucesso do cliente em um só lugar
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all">
              Começar Agora →
            </Link>
            <button className="px-8 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              Agendar Demo
            </button>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {modules.map((module) => (
            <Link key={module.title} to={module.href}>
              <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <div className={`h-32 bg-gradient-to-br ${module.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10 bg-white"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                    {module.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      Acessar →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tabbed Content */}
        <Tabs tabs={tabs} defaultTab="overview" variant="pill" />

        {/* Recent Data */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Recent Leads</h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentData.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.role}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.company}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                      View
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-700 mt-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">RAVO OS</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plataforma empresarial de operações estratégicas</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="/crm" className="hover:text-gray-900 dark:hover:text-white">CRM</a></li>
                <li><a href="/finance" className="hover:text-gray-900 dark:hover:text-white">Finance</a></li>
                <li><a href="/goals" className="hover:text-gray-900 dark:hover:text-white">Goals</a></li>
                <li><a href="/cs" className="hover:text-gray-900 dark:hover:text-white">CS</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Termos</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 RAVO OS. All rights reserved. Enterprise-grade operations platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
