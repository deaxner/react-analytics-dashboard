import Card from './Card';

function EmptyState({
  title = 'No data available',
  message = 'There are no tasks that match the current filters.',
}) {
  return (
    <Card className="state-card">
      <p className="state-card__eyebrow">No results</p>
      <h2>{title}</h2>
      <p>{message}</p>
    </Card>
  );
}

export default EmptyState;
