import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Check, Minus } from 'lucide-react';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIndexes: number[]) => void;
  paginated?: boolean;
  pageSize?: number;
  striped?: boolean;
  hoverable?: boolean;
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  selectable = false,
  onSelectionChange,
  paginated = true,
  pageSize = 10,
  striped = true,
  hoverable = true,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  // Sort logic
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = paginated
    ? sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : sortedData;

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelected = new Set(paginatedData.map((_, i) => currentPage * pageSize + i));
      setSelectedRows(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Table Container */}
      <div
        style={{
          borderRadius: '8px',
          border: '0.5px solid rgba(255,255,255,0.04)',
          overflow: 'hidden',
          background: '#0B0E19',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}
        >
          {/* Header */}
          <thead>
            <tr
              style={{
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              {selectable && (
                <th
                  style={{
                    width: '40px',
                    padding: '12px 16px',
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={handleSelectAll}
                    style={{
                      background: selectedRows.size > 0 ? '#EA6A1B' : 'transparent',
                      border: `1px solid ${selectedRows.size > 0 ? '#EA6A1B' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '4px',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 200ms ease-out',
                      padding: 0,
                      color: 'white',
                    }}
                  >
                    {selectedRows.size === paginatedData.length && <Check size={12} strokeWidth={3} />}
                    {selectedRows.size > 0 && selectedRows.size < paginatedData.length && (
                      <Minus size={12} strokeWidth={3} />
                    )}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    padding: '12px 16px',
                    textAlign: col.align || 'left',
                    width: col.width,
                    color: '#9CA3AF',
                    fontWeight: '600',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    transition: 'all 200ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    if (col.sortable) {
                      (e.currentTarget as HTMLElement).style.color = '#EBEBF0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = '#9CA3AF';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.label}
                    {col.sortable && (
                      <span
                        style={{
                          opacity:
                            sortConfig?.key === col.key ? 1 : 0.3,
                          transition: 'all 200ms ease-out',
                        }}
                      >
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedData.map((row, idx) => {
              const actualIndex = currentPage * pageSize + idx;
              const isSelected = selectedRows.has(actualIndex);

              return (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row, actualIndex)}
                  style={{
                    borderBottom: '0.5px solid rgba(255,255,255,0.03)',
                    background: isSelected
                      ? 'rgba(234, 106, 27, 0.08)'
                      : striped && idx % 2 === 0
                        ? 'rgba(255,255,255,0.01)'
                        : 'transparent',
                    transition: 'all 200ms ease-out',
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onMouseEnter={(e) => {
                    if (hoverable) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(234, 106, 27, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = isSelected
                      ? 'rgba(234, 106, 27, 0.08)'
                      : striped && idx % 2 === 0
                        ? 'rgba(255,255,255,0.01)'
                        : 'transparent';
                  }}
                >
                  {selectable && (
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRow(actualIndex);
                        }}
                        style={{
                          background: isSelected ? '#EA6A1B' : 'transparent',
                          border: `1px solid ${isSelected ? '#EA6A1B' : 'rgba(255,255,255,0.2)'}`,
                          borderRadius: '4px',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 200ms ease-out',
                          padding: 0,
                          color: 'white',
                        }}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </button>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      style={{
                        padding: '12px 16px',
                        textAlign: col.align || 'left',
                        color: '#EBEBF0',
                      }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            fontSize: '13px',
            color: '#9CA3AF',
          }}
        >
          <span>
            Mostrando {currentPage * pageSize + 1} até{' '}
            {Math.min((currentPage + 1) * pageSize, sortedData.length)} de{' '}
            {sortedData.length}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '0.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
                color: currentPage === 0 ? '#6B7280' : '#9CA3AF',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease-out',
              }}
            >
              Anterior
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    border: currentPage === i
                      ? '0.5px solid #EA6A1B'
                      : '0.5px solid rgba(255,255,255,0.1)',
                    background: currentPage === i
                      ? 'rgba(234, 106, 27, 0.15)'
                      : 'rgba(255,255,255,0.02)',
                    color: currentPage === i ? '#EA6A1B' : '#9CA3AF',
                    cursor: 'pointer',
                    fontWeight: currentPage === i ? '600' : '400',
                    transition: 'all 200ms ease-out',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '0.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
                color: currentPage === totalPages - 1 ? '#6B7280' : '#9CA3AF',
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease-out',
              }}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
