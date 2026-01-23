'use client';

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Checkbox({ label, error, className = '', ...props }: CheckboxProps) {
  return (
    <div className="mb-4">
      <label className="flex items-center">
        <input
          type="checkbox"
          className={`mr-2 ${className} ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

