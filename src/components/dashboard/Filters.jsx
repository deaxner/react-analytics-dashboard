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

const BILLING_OPTIONS = [
  { label: 'All billing models', value: 'all' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'SLA', value: 'sla' },
  { label: 'Fixed retainer', value: 'fixed_retainer' },
];

function Filters({ filters, projects, clients, onChange, onRefresh, refreshing }) {
  const projectOptions = [
    { label: 'All projects', value: 'all' },
    ...projects.map((project) => ({
      label: project.name,
      value: String(project.id),
    })),
  ];
  const clientOptions = [
    { label: 'All clients', value: 'all' },
    ...clients.map((client) => ({
      label: client.company ?? client.name,
      value: String(client.id ?? client.name),
    })),
  ];

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
        <Select
          id="project"
          label="Project"
          options={projectOptions}
          value={filters.projectId}
          onChange={(event) =>
            onChange((current) => ({ ...current, projectId: event.target.value }))
          }
        />
        <Select
          id="client"
          label="Client"
          options={clientOptions}
          value={filters.clientId}
          onChange={(event) =>
            onChange((current) => ({ ...current, clientId: event.target.value }))
          }
        />
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
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={filters.priority}
          onChange={(event) =>
            onChange((current) => ({ ...current, priority: event.target.value }))
          }
        />
        <Select
          id="billing-model"
          label="Billing model"
          options={BILLING_OPTIONS}
          value={filters.billingModel}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              billingModel: event.target.value,
            }))
          }
        />
      </div>
    </Card>
  );
}

export default Filters;
