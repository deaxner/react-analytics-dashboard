function Loader({ label = 'Loading dashboard' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__ring" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;
