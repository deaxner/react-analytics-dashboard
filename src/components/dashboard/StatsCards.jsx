import Card from '../ui/Card';

function StatsCards({ items }) {
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <Card key={item.label} className={`stat-card stat-card--${item.accent}`}>
          <p className="stat-card__label">{item.label}</p>
          <strong className="stat-card__value">{item.value}</strong>
        </Card>
      ))}
    </div>
  );
}

export default StatsCards;
