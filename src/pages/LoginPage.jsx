import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(credentials);
      navigate(location.state?.from || '/', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-shell__backdrop" />
      <section className="auth-panel">
        <div className="auth-panel__topbar">
          <div>
            <p className="section-kicker">Symfony analytics client</p>
            <h1>Task signal cockpit</h1>
          </div>
          <ThemeToggle />
        </div>

        <Card className="auth-card">
          <div className="auth-copy">
            <p className="section-kicker">Sign in</p>
            <h2>Track delivery flow in one place</h2>
            <p>
              Connect to the Symfony task API, pull your task stream, and turn it
              into a focused analytics view.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={credentials.email}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
            {error ? <p className="form-error">{error}</p> : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Open dashboard'}
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}

export default LoginPage;
