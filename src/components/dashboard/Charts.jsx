import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../ui/Card';

const STATUS_COLORS = ['#57b6ff', '#f4b65f', '#45d483'];
function Charts({ analytics }) {
  return (
    <div className="charts-grid">
      <Card className="chart-card chart-card--wide">
        <div className="chart-card__header">
          <p className="section-kicker">Timeline</p>
          <h2>Intake vs completion flow</h2>
        </div>
        <div className="chart-card__body">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.timelineFlow}>
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
                dataKey="created"
                name="Created"
                stroke="#57b6ff"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#45d483"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="chart-card">
        <div className="chart-card__header">
          <p className="section-kicker">Projects</p>
          <h2>Margin by project</h2>
        </div>
        <div className="chart-card__body">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.marginByProject}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" stroke="var(--chart-axis)" />
              <YAxis stroke="var(--chart-axis)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                }}
              />
              <Bar dataKey="margin" radius={[10, 10, 0, 0]}>
                {analytics.marginByProject.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color ?? STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="chart-card">
        <div className="chart-card__header">
          <p className="section-kicker">Priority</p>
          <h2>Average revenue vs cost</h2>
        </div>
        <div className="chart-card__body">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.revenueCostByPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" stroke="var(--chart-axis)" />
              <YAxis stroke="var(--chart-axis)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                }}
              />
              <Bar dataKey="revenue" fill="#57b6ff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="cost" fill="#ff8a65" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="chart-card chart-card--wide">
        <div className="chart-card__header">
          <p className="section-kicker">Profitability</p>
          <h2>Client margin and unpaid exposure</h2>
        </div>
        <div className="chart-card__body">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.clientProfitability}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" stroke="var(--chart-axis)" />
              <YAxis stroke="var(--chart-axis)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                }}
              />
              <Bar dataKey="margin" fill="#45d483" radius={[8, 8, 0, 0]} />
              <Bar dataKey="unpaidExposure" fill="#f4b65f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default Charts;
