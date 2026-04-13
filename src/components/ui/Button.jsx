function Button({
  children,
  className = '',
  disabled = false,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
