import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

const PRIORITY_OPTIONS = [
  { label: 'All priorities', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

function Filters({ filters, onChange, onRefresh, refreshing }) {
  return (
    <Card className="filters-card">
      <div className="filters-card__header">
        <div>
          <p className="section-kicker">Filters</p>
          <h2>Refine your task signal</h2>
        </div>
        <Button onClick={onRefresh} variant="secondary" disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh data'}
        </Button>
      </div>
      <div className="filters-grid">
        <Input
          id="start-date"
          label="Start date"
          type="date"
          value={filters.startDate}
          onChange={(event) =>
            onChange((current) => ({ ...current, startDate: event.target.value }))
          }
        />
        <Input
          id="end-date"
          label="End date"
          type="date"
          value={filters.endDate}
          onChange={(event) =>
            onChange((current) => ({ ...current, endDate: event.target.value }))
          }
        />
        <Select
          id="priority"
          label="Category"
          options={PRIORITY_OPTIONS}
          value={filters.priority}
          onChange={(event) =>
            onChange((current) => ({ ...current, priority: event.target.value }))
          }
        />
      </div>
    </Card>
  );
}

export default Filters;
