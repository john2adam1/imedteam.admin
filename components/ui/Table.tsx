'use client';

import React from 'react';

interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function Table<T extends { id: string }>({ data, columns, onEdit, onDelete }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th key={column.key} className="border border-gray-300 px-4 py-2 text-left">
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="border border-gray-300 px-4 py-2">
                    {column.render ? column.render(item) : (() => {
                      const val = (item as any)[column.key];
                      if (typeof val === 'object' && val !== null && !React.isValidElement(val)) {
                        // Check if it's a date safely (simple check)
                        if (val instanceof Date) return val.toLocaleDateString();

                        console.error(`Table Error: Column "${column.key}" is trying to render an object without a render function. Value:`, val);
                        return typeof val === 'object' ? JSON.stringify(val) : String(val);
                      }
                      return val;
                    })()}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

