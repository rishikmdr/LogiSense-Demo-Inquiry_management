import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border-active rounded-lg p-3 shadow-xl">
      <p className="text-text-primary font-medium text-sm mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-text-secondary text-xs">{p.value} inquiries</p>
      ))}
    </div>
  );
};

export function RouteChart({ data = [] }) {
  // Aggregate by direction
  const aggregated = {};
  for (const row of data) {
    if (!aggregated[row.direction]) aggregated[row.direction] = 0;
    aggregated[row.direction] += parseInt(row.count);
  }

  const chartData = Object.entries(aggregated)
    .map(([direction, count]) => ({ direction: direction.length > 20 ? direction.slice(0, 18) + '…' : direction, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (!chartData.length) {
    return (
      <div className="bg-bg-card border border-border-subtle rounded-xl p-5 flex items-center justify-center h-64">
        <p className="text-text-muted">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
      <h3 className="text-text-primary font-semibold mb-4">Inquiries by Trade Route</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 10 }}>
          <XAxis type="number" tick={{ fill: '#8899b5', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="direction" type="category" tick={{ fill: '#8899b5', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#252d40' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={`hsl(${210 + i * 15}, 70%, 55%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
