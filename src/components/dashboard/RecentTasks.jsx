import Card from '../ui/Card';

function RecentTasks({ tasks }) {
  return (
    <Card className="recent-card">
      <div className="recent-card__header">
        <div>
          <p className="section-kicker">Recent tasks</p>
          <h2>Latest workflow changes</h2>
        </div>
      </div>
      <div className="recent-list">
        {tasks.map((task) => (
          <article className="recent-item" key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.description || 'No description provided.'}</p>
            </div>
            <div className="recent-item__meta">
              <span className={`pill pill--${task.status}`}>{task.status}</span>
              <span className={`pill pill--priority-${task.priority}`}>
                {task.priority}
              </span>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

export default RecentTasks;
