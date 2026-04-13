import Button from './Button';
import Card from './Card';

function ErrorState({ message, onRetry }) {
  return (
    <Card className="state-card state-card--error">
      <p className="state-card__eyebrow">Connection problem</p>
      <h2>Dashboard data could not be loaded</h2>
      <p>{message}</p>
      {onRetry ? (
        <Button onClick={onRetry} variant="secondary">
          Retry
        </Button>
      ) : null}
    </Card>
  );
}

export default ErrorState;
