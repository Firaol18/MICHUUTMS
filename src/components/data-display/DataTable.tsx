import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  noWrap?: boolean;
}

export interface FilterField {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
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
  minTableWidth?: string;

  // Modal-Style Multi-Field Filter Support
  filterFields?: FilterField[];
  filterModalTitle?: string;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;

  // Single-dropdown / legacy support
  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
  customFilter?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  initialPageSize = 10,
  showIndexColumn = true,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  entityName = 'entries',
  minTableWidth = '1000px',
  filterFields,
  filterModalTitle,
  onApplyFilters,
  onClearFilters,
  filterOptions,
  activeFilter,
  onFilterChange,
  filterLabel = 'Filter',
  customFilter,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close filter popover modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Reset to page 1 whenever data, page size or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize, searchQuery, activeFilter]);

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

  const hasFilterSupport =
    (filterFields && filterFields.length > 0) ||
    (filterOptions && filterOptions.length > 0) ||
    customFilter ||
    onApplyFilters;

  const modalTitle =
    filterModalTitle ||
    (entityName ? `Filter ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}` : 'Filter Options');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Search, Filter & Rows Per Page Control Bar */}
      <div
        className="flex-between"
        style={{
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Search Box and Filter Button Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 280, maxWidth: 650 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={15}
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

          {/* Filter Popover Button */}
          {hasFilterSupport && (
            <div style={{ position: 'relative' }} ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
                title="Open Filter Options"
              >
                <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                <span>Filter</span>
              </button>

              {/* Filter Popover Modal Card */}
              {isFilterOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    zIndex: 100,
                    width: '380px',
                    maxWidth: '90vw',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
                    padding: '1.25rem',
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {modalTitle}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                      }}
                      aria-label="Close filters"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {/* Filter Fields Content */}
                  {filterFields && filterFields.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      {filterFields.map((field) => (
                        <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {field.label}
                          </label>
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 500,
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          >
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  ) : customFilter ? (
                    <div style={{ marginBottom: '1.5rem' }}>{customFilter}</div>
                  ) : filterOptions && filterOptions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {filterLabel}
                      </label>
                      <select
                        value={activeFilter || 'all'}
                        onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {filterOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {/* Modal Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClearFilters?.();
                        setIsFilterOpen(false);
                      }}
                      style={{ padding: '0.45rem 1rem' }}
                    >
                      Clear Filters
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onApplyFilters?.();
                        setIsFilterOpen(false);
                      }}
                      style={{ padding: '0.45rem 1rem', fontWeight: 700 }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Show: [10 v] entries */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
            Show:
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {[5, 10, 15, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
            {entityName}
          </span>
        </div>
      </div>

      {/* Main Unified Data Table Card */}
      <div
        className="tms-table-container"
        style={{
          padding: 0,
          overflowX: 'auto',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table
          className="tms-table"
          style={{ width: '100%', minWidth: minTableWidth, borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              {showIndexColumn && (
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, width: 50, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                  #
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '0.875rem 1rem',
                    textAlign: col.align || 'left',
                    fontWeight: 700,
                    width: col.width,
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    whiteSpace: col.noWrap ? 'nowrap' : 'normal',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showIndexColumn ? 1 : 0)}
                  style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => {
                const globalIndex = startIndex + rowIdx + 1;
                return (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick && onRowClick(item)}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 0.15s ease',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                    className="tms-table-row"
                  >
                    {showIndexColumn && (
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {globalIndex}
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: col.align || 'left',
                          width: col.width,
                          minWidth: col.minWidth,
                          maxWidth: col.maxWidth,
                          color: 'var(--text-primary)',
                          verticalAlign: 'middle',
                          whiteSpace: col.noWrap ? 'nowrap' : 'normal',
                        }}
                      >
                        {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '') : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        className="flex-between"
        style={{
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)',
          padding: '0.25rem 0.25rem',
        }}
      >
        <div>
          Showing <strong>{totalEntries === 0 ? 0 : startIndex + 1}</strong> to{' '}
          <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> {entityName}
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: safePage <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
              opacity: safePage <= 1 ? 0.5 : 1,
            }}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page Indicators */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && p - prev > 1;

              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span style={{ padding: '0 0.25rem', color: 'var(--text-muted)' }}>...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${p === safePage ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                      backgroundColor: p === safePage ? 'var(--brand-primary)' : 'var(--bg-primary)',
                      color: p === safePage ? '#ffffff' : 'var(--text-primary)',
                      fontWeight: p === safePage ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: safePage >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: safePage >= totalPages ? 0.5 : 1,
            }}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
