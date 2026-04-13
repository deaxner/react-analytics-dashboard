function Select({ label, id, options, ...props }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <select className="field__control" id={id} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default Select;
