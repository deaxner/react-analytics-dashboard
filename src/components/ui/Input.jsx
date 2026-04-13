function Input({ label, id, ...props }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <input className="field__control" id={id} {...props} />
    </label>
  );
}

export default Input;
