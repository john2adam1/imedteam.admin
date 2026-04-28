'use client';

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputClassName?: string;
}

export function Checkbox({ label, error, className = '', inputClassName = '', ...props }: CheckboxProps) {
  return (
    <div className={className || 'mb-4'}>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          className={`mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${inputClassName} ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

