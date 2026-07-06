/**
 * RAVO OS — Executive Dashboard
 * Professional analytics and operations dashboard
 */

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from '@/components/StatsCard';
import { DataGrid } from '@/components/DataGrid';

const Dashboard = () => {
  // Revenue Data
  const revenueData = [
    { month: 'Jan', revenue: 4000, target: 4200 },
    { month: 'Feb', revenue: 3800, target: 4200 },
    { month: 'Mar', revenue: 4200, target: 4200 },
    { month: 'Apr', revenue: 4800, target: 4500 },
    { month: 'May', revenue: 5200, target: 5000 },
    { month: 'Jun', revenue: 5800, target: 5500 },
  ];

  // Pipeline Data
  const pipelineData = [
    { name: 'Leads', value: 1240, color: '#ff6b35' },
    { name: 'Qualified', value: 340, color: '#ff8555' },
    { name: 'Proposals', value: 120, color: '#ffa875' },
    { name: 'Closed', value: 45, color: '#ffb88a' },
  ];

  // Recent Leads
  const leadsColumns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'company', label: 'Company', sortable: true },
    { id: 'value', label: 'Value', render: (v: any) => `$${v}` },
    { id: 'status', label: 'Status', render: (v: any) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        v === 'qualified' ? 'bg-orange-100 text-orange-700' :
        v === 'contacted' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {v.charAt(0).toUpperCase() + v.slice(1)}
      </span>
    )},
  ];

  const leadsData = [
    { name: 'João Silva', company: 'TechCorp', value: 15000, status: 'qualified' },
    { name: 'Maria Santos', company: 'DataSys', value: 8500, status: 'contacted' },
    { name: 'Pedro Costa', company: 'CloudApp', value: 12000, status: 'qualified' },
    { name: 'Ana Oliveira', company: 'WebSolutions', value: 6500, status: 'new' },
    { name: 'Carlos Lima', company: 'TechInnovate', value: 18000, status: 'qualified' },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid-4">
        <StatsCard
          title="Total Revenue"
          value="$45.2K"
          icon="📈"
          color="green"
          trend={{ direction: 'up', percentage: 12 }}
        />
        <StatsCard
          title="Active Leads"
          value="1,240"
          icon="👥"
          color="blue"
          trend={{ direction: 'up', percentage: 8 }}
        />
        <StatsCard
          title="Conversion Rate"
          value="3.6%"
          icon="🎯"
          color="orange"
          trend={{ direction: 'up', percentage: 2 }}
        />
        <StatsCard
          title="Open Tickets"
          value="34"
          icon="🔔"
          color="red"
          trend={{ direction: 'down', percentage: 5 }}
        />
      </div>

      {/* Charts */}
      <div className="grid-2 gap-6">
        {/* Revenue Trend */}
        <div className="card p-6">
          <h3 className="font-bold mb-6">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#ff6b35" fillOpacity={1} fill="url(#colorRevenue)" />
              <Line type="monotone" dataKey="target" stroke="#999" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Distribution */}
        <div className="card p-6">
          <h3 className="font-bold mb-6">Sales Pipeline</h3>
          <ResponsiveContainer width="100%" height={300}>
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            {pipelineData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold mb-6">Conversion by Stage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { stage: 'Leads', conversion: 28 },
              { stage: 'Qualified', conversion: 45 },
              { stage: 'Proposals', conversion: 62 },
              { stage: 'Closed', conversion: 100 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="conversion" fill="#ff6b35" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-bold mb-6">Team Performance</h3>
          <div className="space-y-4">
            {[
              { name: 'João Silva', deals: 12, revenue: '$45K', completion: 95 },
              { name: 'Maria Santos', deals: 8, revenue: '$32K', completion: 87 },
              { name: 'Pedro Costa', deals: 15, revenue: '$58K', completion: 92 },
            ].map((member) => (
              <div key={member.name}>
                <div className="flex-between mb-2">
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-sm text-gray-500">{member.deals} deals • {member.revenue}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                    style={{ width: `${member.completion}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="card p-6">
        <h3 className="font-bold mb-6">Recent Leads</h3>
        <DataGrid columns={leadsColumns} data={leadsData} />
      </div>
    </div>
  );
};

export default Dashboard;
