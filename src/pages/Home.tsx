/**
 * RAVO OS — Home Page
 * Professional, modern, with personality
 */

import { Link } from 'react-router-dom';

export default function HomePage() {
  const modules = [
    {
      title: 'CRM',
      description: 'Gerenciar leads e pipeline de vendas com inteligência',
      href: '/crm',
      stat: '0 Leads',
      statLabel: 'em pipeline',
    },
    {
      title: 'Finance',
      description: 'Análise financeira e fluxo de caixa em tempo real',
      href: '/finance',
      stat: '$0.00',
      statLabel: 'receita',
    },
    {
      title: 'Goals',
      description: 'Acompanhar KPIs e metas estratégicas da empresa',
      href: '/goals',
      stat: '0%',
      statLabel: 'progresso',
    },
    {
      title: 'Customer Success',
      description: 'Gerenciar tickets e satisfação dos clientes',
      href: '/cs',
      stat: '0',
      statLabel: 'tickets abertos',
    },
  ];

  const features = [
    { title: 'Real-time', description: 'Dados atualizados instantaneamente' },
    { title: 'Integrado', description: 'Todos os módulos sincronizados' },
    { title: 'Escalável', description: 'Cresce com sua empresa' },
    { title: 'Seguro', description: 'Autenticação e permissões robustas' },
  ];

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className="border-b border-current border-opacity-5 sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="container flex-between py-4">
          <Link to="/" className="flex gap-2 items-center">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex-center text-white font-bold text-sm shadow-sm">
              R
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">RAVO OS</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Operations</p>
            </div>
          </Link>
          <div className="flex gap-3">
            <Link to="/login" className="btn-ghost text-sm">
              Login
            </Link>
            <Link to="/signup" className="btn-primary text-sm">
              Começar →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-32">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 rounded-full border border-orange-100 dark:border-orange-900/50">
            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
            <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Plataforma Enterprise</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Central de Operações <span className="text-orange-600">Estratégicas</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Gerencie leads, finanças, metas e relacionamento com clientes em uma plataforma integrada. Desenvolvido para empresas que crescem rápido.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link to="/login" className="btn-primary">
              Acessar Sistema
            </Link>
            <button className="btn-secondary">
              Ver Demo
            </button>
          </div>
        </div>

        {/* Preview Cards */}
        <div className="grid-2 mt-20">
          <div className="card p-8 bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/10">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Módulo CRM</p>
            <h3 className="text-xl font-bold mb-4">Gerencia de Leads</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Pipeline visual, automações e inteligência comercial para fechar mais deals.</p>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">leads em pipeline</p>
          </div>

          <div className="card p-8 bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/10">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Módulo Finance</p>
            <h3 className="text-xl font-bold mb-4">Controle Financeiro</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Receitas, despesas, fluxo de caixa e relatórios financeiros em tempo real.</p>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-gray-500">receita acumulada</p>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="bg-gray-50/50 dark:bg-white/5 py-20">
        <div className="container">
          <div className="mb-16">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Módulos</p>
            <h2 className="text-3xl font-bold">Tudo que você precisa para operar</h2>
          </div>

          <div className="grid-4 gap-6">
            {modules.map((module) => (
              <Link key={module.title} to={module.href}>
                <div className="card p-6 h-full hover:border-orange-200 dark:hover:border-orange-800/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/10 group">
                  <div className="flex-between mb-4">
                    <h3 className="font-bold">{module.title}</h3>
                    <span className="text-orange-600 text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1">
                    {module.description}
                  </p>

                  <div className="pt-4 border-t border-current border-opacity-5">
                    <div className="text-lg font-bold mb-1">{module.stat}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{module.statLabel}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="grid-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title}>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/30 rounded-lg flex-center mb-4">
                <span className="text-lg">→</span>
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-orange-50 to-white dark:from-orange-950/20 dark:to-black/20 py-20">
        <div className="container">
          <div className="grid-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">0</div>
              <p className="text-gray-600 dark:text-gray-400">Leads gerenciados</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$0.00</div>
              <p className="text-gray-600 dark:text-gray-400">Sob gestão financeira</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">0%</div>
              <p className="text-gray-600 dark:text-gray-400">Metas acompanhadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Pronto para começar?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Milhares de empresas usam RAVO OS para centralizar e automatizar suas operações estratégicas.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" className="btn-primary">
            Acessar Agora
          </Link>
          <button className="btn-secondary">
            Agendar Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-current border-opacity-5 bg-gray-50/50 dark:bg-white/5">
        <div className="container py-16">
          <div className="grid-4 gap-8 mb-12">
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Produto</p>
              <ul className="space-y-3 text-sm">
                <li><a href="/crm" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">CRM</a></li>
                <li><a href="/finance" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Finance</a></li>
                <li><a href="/goals" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Goals</a></li>
                <li><a href="/cs" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">CS</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Recursos</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Documentação</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">API</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Suporte</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Help Center</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Contato</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Status</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Legal</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Privacidade</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Termos</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 RAVO OS. Todos os direitos reservados.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enterprise Operations Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
