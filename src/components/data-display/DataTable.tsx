import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  initialPageSize?: number;
  showIndexColumn?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  entityName?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  initialPageSize = 5,
  showIndexColumn = true,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  entityName = 'entries',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to page 1 whenever data or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize, searchQuery]);

  if (isLoading) {
    return <LoadingSpinner label="Fetching table records..." />;
  }

  // Pagination calculation
  const totalEntries = data.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Search & Rows Per Page Control Bar */}
      <div
        className="flex-between"
        style={{
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 450 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              padding: '0.45rem 0.875rem 0.45rem 2.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
            Rows Per Page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={`${size} Rows`}>
                {size} Rows
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Unified Data Table Card */}
      <div
        className="tms-table-container"
        style={{
          padding: 0,
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <table
          className="tms-table"
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}
        >
          <thead>
            <tr style={{ backgroundColor: '#034ea2', color: '#ffffff' }}>
              {showIndexColumn && (
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, width: 50 }}>
                  # ↕
                </th>
              )}
              {columns.map((col, idx) => {
                const headerText = col.header.endsWith('↕') ? col.header : `${col.header} ↕`;
                const isActions = col.header.toLowerCase().includes('action');
                return (
                  <th
                    key={idx}
                    style={{
                      padding: '0.875rem 1rem',
                      textAlign: col.align || (isActions ? 'center' : 'left'),
                      fontWeight: 800,
                      width: col.width,
                    }}
                  >
                    {isActions ? col.header.toUpperCase() : headerText.toUpperCase()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showIndexColumn ? 1 : 0)}
                  style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)',
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                >
                  {showIndexColumn && (
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {startIndex + rowIdx + 1}
                    </td>
                  )}
                  {columns.map((col, colIdx) => {
                    const isActions = col.header.toLowerCase().includes('action');
                    return (
                      <td
                        key={colIdx}
                        style={{
                          padding: '0.875rem 1rem',
                          textAlign: col.align || (isActions ? 'center' : 'left'),
                        }}
                      >
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? (row[col.accessorKey] as React.ReactNode)
                          : null}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Unified Bottom Pagination Footer */}
        <div
          className="flex-between"
          style={{
            padding: '0.875rem 1rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          <div style={{ color: 'var(--text-muted)' }}>
            Showing <strong>{totalEntries === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> {entityName}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: safePage <= 1 ? 'transparent' : 'var(--bg-primary)',
                color: safePage <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span style={{ fontWeight: 700, padding: '0 0.5rem' }}>
              Page {safePage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: safePage >= totalPages ? 'transparent' : 'var(--bg-primary)',
                color: safePage >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
