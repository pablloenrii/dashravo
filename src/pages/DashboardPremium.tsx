import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Zap, CheckCircle2, AlertCircle, Code2, Rocket } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { KPICardPremium } from '@/components/KPICardPremium';
import { AnimatedCard } from '@/components/AnimatedCard';
import { TimelinePremium } from '@/components/TimelinePremium';
import { Alert } from '@/components/ui/Alert';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 2000 },
  { month: 'Apr', revenue: 2780 },
  { month: 'May', revenue: 1890 },
  { month: 'Jun', revenue: 2390 },
];

const conversionData = [
  { name: 'Leads', value: 400 },
  { name: 'Qualified', value: 300 },
  { name: 'Converted', value: 200 },
  { name: 'Closed', value: 100 },
];

const pipelineData = [
  { name: 'Discovery', value: 30, fill: '#FF6200' },
  { name: 'Proposal', value: 25, fill: '#FF7A33' },
  { name: 'Negotiation', value: 20, fill: '#FFB366' },
  { name: 'Closed', value: 25, fill: '#FFC99A' },
];

const timelineItems = [
  {
    id: '1',
    title: 'Novo Lead',
    description: 'Acme Corp entrou em contato',
    timestamp: '2 minutos atrás',
    icon: '👤',
    color: '#FF6200',
  },
  {
    id: '2',
    title: 'Proposta Enviada',
    description: 'Proposta para Tech Startup enviada',
    timestamp: '1 hora atrás',
    icon: '📄',
    color: '#3B82F6',
  },
  {
    id: '3',
    title: 'Deal Closed',
    description: 'Enterprise Deal fechado com $50k',
    timestamp: '3 horas atrás',
    icon: '✅',
    color: '#10B981',
  },
  {
    id: '4',
    title: 'Pipeline Update',
    description: 'Q3 quota atualizado para $500k',
    timestamp: '1 dia atrás',
    icon: '📈',
    color: '#A855F7',
  },
];

export function DashboardPremium() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Hero Section */}
      <AnimatedCard delay={0}>
        <HeroSection />
      </AnimatedCard>

      {/* KPI Cards */}
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginTop: '32px',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatedCard delay={0.1}>
          <KPICardPremium
            title="Receita Hoje"
            value="$12,456"
            icon={<DollarSign className="w-5 h-5" />}
            trend={{ direction: 'up', percentage: 12 }}
            color="#FF6200"
          />
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <KPICardPremium
            title="Receita Este Mês"
            value="$145,890"
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{ direction: 'up', percentage: 8 }}
            color="#3B82F6"
          />
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <KPICardPremium
            title="Execuções IA"
            value="342"
            icon={<Code2 className="w-5 h-5" />}
            trend={{ direction: 'up', percentage: 24 }}
            color="#A855F7"
          />
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <KPICardPremium
            title="Economia de Horas"
            value="2,840"
            icon={<Zap className="w-5 h-5" />}
            trend={{ direction: 'up', percentage: 15 }}
            color="#10B981"
          />
        </AnimatedCard>
      </motion.div>

      {/* Alert Banner */}
      <AnimatedCard delay={0.5} style={{ marginTop: '32px' }}>
        <Alert variant="warning">
          ⚠️ Opportunity Alert: Tech startup lead has been inactive for 5 days. Consider follow-up.
        </Alert>
      </AnimatedCard>

      {/* Charts Grid */}
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '32px',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Revenue Chart */}
        <AnimatedCard delay={0.6}>
          <div
            style={{
              background: 'rgba(15,23,42,0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h3 style={{ margin: '0 0 24px 0', color: 'white', fontSize: '16px', fontWeight: '600' }}>
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6200" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6200" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#FF6200' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF6200"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Pipeline Chart */}
        <AnimatedCard delay={0.7}>
          <div
            style={{
              background: 'rgba(15,23,42,0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h3 style={{ margin: '0 0 24px 0', color: 'white', fontSize: '16px', fontWeight: '600' }}>
              Sales Pipeline
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#FF6200' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Conversion Chart */}
        <AnimatedCard delay={0.8}>
          <div
            style={{
              background: 'rgba(15,23,42,0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h3 style={{ margin: '0 0 24px 0', color: 'white', fontSize: '16px', fontWeight: '600' }}>
              Conversion Funnel
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={conversionData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#FF6200' }}
                />
                <Bar dataKey="value" fill="#FF6200" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Timeline Section */}
      <AnimatedCard delay={0.9} style={{ marginTop: '32px' }}>
        <div
          style={{
            background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h3 style={{ margin: '0 0 24px 0', color: 'white', fontSize: '16px', fontWeight: '600' }}>
            Recent Activity
          </h3>
          <TimelinePremium items={timelineItems} />
        </div>
      </AnimatedCard>
    </motion.div>
  );
}

export default DashboardPremium;
