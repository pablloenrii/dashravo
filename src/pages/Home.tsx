/**
 * RAVO OS — Home Page
 * Professional, minimal, dark-first design
 */

import { Link } from 'react-router-dom';

export default function HomePage() {
  const modules = [
    {
      title: 'CRM',
      description: 'Gerenciar leads e pipeline de vendas',
      href: '/crm',
      icon: '→',
    },
    {
      title: 'Finance',
      description: 'Análise financeira e fluxo de caixa',
      href: '/finance',
      icon: '→',
    },
    {
      title: 'Goals',
      description: 'Acompanhar KPIs e metas estratégicas',
      href: '/goals',
      icon: '→',
    },
    {
      title: 'Customer Success',
      description: 'Gerenciar tickets e satisfação',
      href: '/cs',
      icon: '→',
    },
  ];

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className="border-b border-current border-opacity-10 sticky top-0 z-40 bg-white dark:bg-black/50 backdrop-blur">
        <div className="container flex-between py-4">
          <Link to="/" className="flex gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded flex-center text-white font-bold text-sm">
              R
            </div>
            <div>
              <h1 className="text-sm font-bold">RAVO OS</h1>
              <p className="text-xs text-gray-500">Enterprise</p>
            </div>
          </Link>
          <div className="flex gap-2">
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Começar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-20">
        <div className="max-w-2xl">
          <h1 className="mb-4">Central de Operações Estratégicas</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Gerencie leads, finanças, metas e relacionamento com clientes em uma plataforma integrada.
          </p>
          <div className="flex gap-3">
            <Link to="/login" className="btn-primary">
              Acessar Sistema
            </Link>
            <button className="btn-secondary">
              Documentação
            </button>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container pb-20">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-8">Módulos</p>
        <div className="grid-4">
          {modules.map((module) => (
            <Link key={module.title} to={module.href}>
              <div className="card p-6 hover:bg-orange-50 dark:hover:bg-orange-950/20">
                <h3 className="mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {module.description}
                </p>
                <div className="flex-between">
                  <span className="text-xs font-bold text-orange-600">
                    Acessar
                  </span>
                  <span className="text-orange-600">{module.icon}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-black/20 py-20">
        <div className="container">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-8">Recursos</p>
          <div className="grid-3 mb-12">
            <div>
              <h4 className="mb-2">Integrado</h4>
              <p className="text-sm">Todos os módulos conectados em um só lugar</p>
            </div>
            <div>
              <h4 className="mb-2">Real-time</h4>
              <p className="text-sm">Dados atualizados em tempo real</p>
            </div>
            <div>
              <h4 className="mb-2">Escalável</h4>
              <p className="text-sm">Cresce com seu negócio</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="mb-4 max-w-xl mx-auto">Pronto para começar?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Acesse o sistema e comece a gerenciar suas operações
        </p>
        <Link to="/login" className="btn-primary">
          Acessar Agora
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-current border-opacity-10">
        <div className="container py-12">
          <div className="grid-3 mb-12">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Produto</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="/crm" className="hover:text-orange-600 transition">CRM</a></li>
                <li><a href="/finance" className="hover:text-orange-600 transition">Finance</a></li>
                <li><a href="/goals" className="hover:text-orange-600 transition">Goals</a></li>
                <li><a href="/cs" className="hover:text-orange-600 transition">CS</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Recursos</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-600 transition">Documentação</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">API</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">Suporte</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-600 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">Termos</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">Contato</a></li>
              </ul>
            </div>
          </div>
          <div className="divider"></div>
          <p className="text-sm text-gray-500 text-center">
            © 2024 RAVO OS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
