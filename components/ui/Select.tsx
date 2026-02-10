'use client';

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium leading-none mb-2">
          {label}
        </label>
      )}
      <select
        className={`flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className} ${error ? 'border-destructive' : ''
          }`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}


