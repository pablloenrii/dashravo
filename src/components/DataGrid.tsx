import { useState } from 'react';

interface Column {
  id: string;
  label: string;
  render?: (value: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataGridProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  selectable?: boolean;
  onRowClick?: (row: any) => void;
}

export function DataGrid({
  columns,
  data,
  isLoading = false,
  selectable = false,
  onRowClick,
}: DataGridProps) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const comparison = aVal > bVal ? 1 : -1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            {selectable && (
              <th className="w-12 px-6 py-4 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(new Set(data.map((_, i) => i)));
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.id}
                onClick={() => column.sortable && handleSort(column.id)}
                className={`
                  px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800' : ''}
                `}
                style={{ width: column.width }}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortBy === column.id && (
                    <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                Nenhum dado encontrado
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-gray-200 dark:border-slate-700 transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}
                  ${selectedRows.has(rowIndex) ? 'bg-blue-50 dark:bg-slate-700' : ''}
                `}
              >
                {selectable && (
                  <td className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => toggleRow(rowIndex)}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                    style={{ width: column.width }}
                  >
                    {column.render ? column.render(row[column.id]) : row[column.id]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
