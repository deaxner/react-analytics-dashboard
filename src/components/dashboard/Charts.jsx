import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../ui/Card';

const STATUS_COLORS = ['#57b6ff', '#f4b65f', '#45d483'];
const PRIORITY_COLORS = ['#74c0fc', '#ffd166', '#ff6b6b'];

function Charts({ analytics }) {
  return (
    <div className="charts-grid">
      <Card className="chart-card chart-card--wide">
        <div className="chart-card__header">
          <p className="section-kicker">Timeline</p>
          <h2>Task creation velocity</h2>
        </div>
        <div className="chart-card__body">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.tasksByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" stroke="var(--chart-axis)" />
              <YAxis allowDecimals={false} stroke="var(--chart-axis)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#57b6ff"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="chart-card">
        <div className="chart-card__header">
          <p className="section-kicker">Status</p>
          <h2>Delivery mix</h2>
        </div>
        <div className="chart-card__body">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={analytics.tasksByStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
              >
                {analytics.tasksByStatus.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="chart-card">
        <div className="chart-card__header">
          <p className="section-kicker">Priority</p>
          <h2>Current workload pressure</h2>
        </div>
        <div className="chart-card__body">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.tasksByPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" stroke="var(--chart-axis)" />
              <YAxis allowDecimals={false} stroke="var(--chart-axis)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {analytics.tasksByPriority.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default Charts;
