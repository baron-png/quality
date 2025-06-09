import React from 'react';
interface TextAreaGroupProps {
  label: string;
  name: string;
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string; // ✅ ADD THIS
}


const TextAreaGroup: React.FC<TextAreaGroupProps> = ({ label, name, value, handleChange, placeholder, required }) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="border rounded-md p-2 resize-y min-h-[100px]"
      />
    </div>
  );
};

export { TextAreaGroup };