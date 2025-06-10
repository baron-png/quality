import React from 'react';

interface SelectItem {
  label: string;
  value: string;
  key?: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  items: SelectItem[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean; // <-- Add this
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  items,
  placeholder,
  required,
  error,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled} // Use the disabled prop here
        className="border rounded-md p-2"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option key={item.key || item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default Select;