import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  initialPageSize?: number;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  initialPageSize = 5,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to page 1 whenever data or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize]);

  if (isLoading) {
    return <LoadingSpinner label="Fetching table data..." />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="tms-table-container flex-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  // Pagination calculation
  const totalEntries = data.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div className="tms-table-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <table className="tms-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col, idx) => (
                <td key={idx}>
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                    ? (row[col.accessorKey] as React.ReactNode)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Footer Controls */}
      <div
        className="flex-between"
        style={{
          padding: '0.875rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Left: Entries Counter */}
        <div>
          Showing <strong>{totalEntries > 0 ? startIndex + 1 : 0}</strong> to{' '}
          <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> entries
        </div>

        {/* Center: Rows per page selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Previous & Next Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: safePage <= 1 ? 'transparent' : 'var(--bg-primary)',
              color: safePage <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          <span style={{ fontWeight: 700, padding: '0 0.35rem' }}>
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: safePage >= totalPages ? 'transparent' : 'var(--bg-primary)',
              color: safePage >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
