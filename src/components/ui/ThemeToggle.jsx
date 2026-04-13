import { useTheme } from '../../hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme}>
      <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
      <strong>{theme === 'dark' ? 'Moon' : 'Sun'}</strong>
    </button>
  );
}

export default ThemeToggle;
