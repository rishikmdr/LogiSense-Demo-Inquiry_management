import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS_MAP = {
  'OPEN': '#2d7df6',
  'INITIATED WORKING': '#5ba3ff',
  'CLARIFICATIONS PENDING': '#f5a623',
  'BUDGETARY': '#9b6dff',
  'QUOTED': '#00b8d9',
  'UNDER FIRM DISCUSSIONS': '#ff8c42',
  'SECURED': '#00d4b4',
  'LOST': '#e84040',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border-active rounded-lg p-3 shadow-xl">
      <p className="text-text-primary font-medium text-sm">{payload[0].name}</p>
      <p className="text-text-secondary text-xs">{payload[0].value} inquiries</p>
    </div>
  );
};

export function PipelineChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.status,
    value: parseInt(d.count),
    color: STATUS_COLORS_MAP[d.status] || '#4d607a',
  }));

  if (!chartData.length) {
    return (
      <div className="bg-bg-card border border-border-subtle rounded-xl p-5 flex items-center justify-center h-64">
        <p className="text-text-muted">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
      <h3 className="text-text-primary font-semibold mb-4">Pipeline by Status</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span style={{ color: '#8899b5', fontSize: '11px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
