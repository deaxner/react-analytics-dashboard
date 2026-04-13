import { lazy, Suspense } from 'react';
import Filters from '../components/dashboard/Filters';
import RecentTasks from '../components/dashboard/RecentTasks';
import StatsCards from '../components/dashboard/StatsCards';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Loader from '../components/ui/Loader';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';

const Charts = lazy(() => import('../components/dashboard/Charts'));

function DashboardPage() {
  const { token, user, logout } = useAuth();
  const { analytics, error, filters, loading, refreshing, refresh, setFilters } =
    useDashboardData(token);
  const hasTasks = analytics.summary[0]?.value > 0;

  if (loading) {
    return (
      <main className="dashboard-shell dashboard-shell--loading">
        <Loader />
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <p className="section-kicker">Operational analytics</p>
          <h1>Task delivery dashboard</h1>
          <p className="dashboard-hero__copy">
            View task velocity, bottlenecks, and delivery pressure across the
            current API-backed workflow.
          </p>
          <p className="dashboard-hero__meta">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="dashboard-hero__actions">
          <ThemeToggle />
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </section>

      <Filters
        filters={filters}
        onChange={setFilters}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : !hasTasks ? (
        <EmptyState />
      ) : (
        <>
          <StatsCards items={analytics.summary} />
          <Suspense fallback={<Loader label="Loading charts" />}>
            <Charts analytics={analytics} />
          </Suspense>
          <RecentTasks tasks={analytics.recentTasks} />
        </>
      )}
    </main>
  );
}

export default DashboardPage;
