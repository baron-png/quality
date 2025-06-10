import React from 'react';
interface TextAreaGroupProps {
  label: string;
  name: string;
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean; // Optional prop to disable the textarea
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
        disabled={false} // You can set this to true if you want to disable the textarea
        required={required}
        className="border rounded-md p-2 resize-y min-h-[100px]"
      />
    </div>
  );
};

export { TextAreaGroup };