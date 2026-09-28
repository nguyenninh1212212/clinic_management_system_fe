// src/components/common/DataTable.tsx
import React, { ReactNode, useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Skeleton,
  Box,
  Button,
  Checkbox,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import { EmptyState } from './EmptyState';
import { PaginationMeta } from '@/types';

export type ColumnFilterValue = string | number | boolean;

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  render?: (row: T, index: number) => ReactNode;

  // Filter configuration
  filterType?: 'select' | 'input' | 'checkbox';
  filters?: Array<{ text: string; value: ColumnFilterValue | undefined | null }>;
  filteredValue?: ColumnFilterValue[] | ColumnFilterValue | null;
  filterPlaceholder?: string;
  filterMultiple?: boolean;

  // Direct column-level change callback
  onChange?: (value: any) => void;
  onFilterChange?: (value: any) => void;
  onFilter?: (value: ColumnFilterValue, row: T) => boolean;
}

export interface TablePaginationParam {
  page: number;
  limit: number;
}

export type TableFiltersParam = Record<string, any>;

export interface TableChangeParams extends TablePaginationParam {
  filters: TableFiltersParam;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  pagination?: PaginationMeta;
  filters?: Record<string, any>;
  serverSide?: boolean;
  onChange?: (
    pagination: TableChangeParams,
    filters: TableFiltersParam,
  ) => void;
  onFilterChange?: (filters: TableFiltersParam) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  getRowId?: (row: T) => string | number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  loading = false,
  pagination,
  filters: propsFilters,
  serverSide,
  onChange,
  onFilterChange,
  onPageChange,
  onLimitChange,
  emptyTitle,
  emptyDescription,
  emptyActionText,
  onEmptyAction,
  getRowId,
}: DataTableProps<T>) {
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [filterColumnId, setFilterColumnId] = useState<string | null>(null);
  const [internalFilters, setInternalFilters] = useState<TableFiltersParam>({});
  const [inputValue, setInputValue] = useState<string>('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const getColumnFilterValue = (col: Column<T>): any => {
    if (col.filteredValue !== undefined) {
      return col.filteredValue;
    }
    if (propsFilters && col.id in propsFilters) {
      return propsFilters[col.id];
    }
    return internalFilters[col.id];
  };

  const isColumnFiltered = (col: Column<T>): boolean => {
    const val = getColumnFilterValue(col);
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const filterColumn = columns.find((column) => column.id === filterColumnId);

  // Trigger filter change directly on column and table
  const triggerFilter = (columnId: string, val: any) => {
    const targetCol = columns.find((c) => c.id === columnId);
    if (!targetCol) return;

    let normalizedVal = val;
    if (val === '' || val === null || (Array.isArray(val) && val.length === 0)) {
      normalizedVal = undefined;
    }

    // 1. Column-level onChange & onFilterChange
    targetCol.onChange?.(normalizedVal);
    targetCol.onFilterChange?.(normalizedVal);

    // 2. Internal state update
    const nextInternal = { ...internalFilters };
    if (normalizedVal !== undefined) {
      nextInternal[columnId] = normalizedVal;
    } else {
      delete nextInternal[columnId];
    }
    setInternalFilters(nextInternal);

    // 3. Table-level onChange & onFilterChange
    const allFilters: TableFiltersParam = {};
    columns.forEach((c) => {
      const v = c.id === columnId ? normalizedVal : getColumnFilterValue(c);
      if (v !== undefined && v !== null && v !== '') {
        allFilters[c.id] = v;
      }
    });

    onFilterChange?.(allFilters);
    onChange?.(
      { page: 1, limit: pagination?.limit || 10, filters: allFilters },
      allFilters,
    );
  };

  // If server-side (default when pagination or onChange/onFilterChange or column.onChange is present),
  // DO NOT filter on FE. The backend query handles filtering.
  const hasColumnOnChange = columns.some((c) => Boolean(c.onChange || c.onFilterChange));
  const isServerSide =
    serverSide !== undefined
      ? serverSide
      : Boolean(pagination || onChange || onFilterChange || hasColumnOnChange);

  const displayRows = React.useMemo(() => {
    if (isServerSide) {
      return rows;
    }

    return rows.filter((row) =>
      columns.every((col) => {
        const val = getColumnFilterValue(col);
        if (val === undefined || val === null || val === '') return true;
        if (Array.isArray(val)) {
          if (val.length === 0) return true;
          return val.some((v) =>
            col.onFilter ? col.onFilter(v, row) : row[col.id] === v,
          );
        }
        if (col.onFilter) {
          return col.onFilter(val, row);
        }
        return String(row[col.id] ?? '').toLowerCase().includes(String(val).toLowerCase());
      }),
    );
  }, [rows, isServerSide, columns, internalFilters, propsFilters]);

  const openFilter = (event: React.MouseEvent<HTMLElement>, column: Column<T>) => {
    setFilterAnchor(event.currentTarget);
    setFilterColumnId(column.id);
    const currentVal = getColumnFilterValue(column);
    if (column.filterType === 'input') {
      setInputValue(currentVal ? String(currentVal) : '');
    }
  };

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
    const allFilters: TableFiltersParam = {};
    columns.forEach((c) => {
      const v = getColumnFilterValue(c);
      if (v !== undefined && v !== null && v !== '') {
        allFilters[c.id] = v;
      }
    });
    onChange?.(
      { page: newPage, limit: pagination?.limit || 10, filters: allFilters },
      allFilters,
    );
  };

  const handleLimitChange = (newLimit: number) => {
    onLimitChange?.(newLimit);
    const allFilters: TableFiltersParam = {};
    columns.forEach((c) => {
      const v = getColumnFilterValue(c);
      if (v !== undefined && v !== null && v !== '') {
        allFilters[c.id] = v;
      }
    });
    onChange?.(
      { page: 1, limit: newLimit, filters: allFilters },
      allFilters,
    );
  };

  const hasFilter = (col: Column<T>) =>
    Boolean(
      (col.filters && col.filters.length > 0) ||
      col.filterType === 'input' ||
      col.filterType === 'select' ||
      col.filterType === 'checkbox',
    );

  return (
    <Paper className="border border-slate-200 overflow-hidden rounded-xl">
      <TableContainer sx={{ maxHeight: 680 }}>
        <Table stickyHeader size="small" aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  className="bg-slate-50 text-slate-700 font-semibold text-xs tracking-wider uppercase py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{column.label}</span>
                    {hasFilter(column) && (
                      <Tooltip
                        title={
                          isColumnFiltered(column)
                            ? `Đang lọc: ${column.label}`
                            : column.filterType === 'input'
                            ? `Tìm kiếm: ${column.label}`
                            : `Lọc theo ${column.label}`
                        }
                      >
                        <IconButton
                          size="small"
                          aria-label={`Lọc theo ${column.label}`}
                          onClick={(event) => openFilter(event, column)}
                          className={
                            isColumnFiltered(column)
                              ? 'text-sky-700 bg-sky-100/80 hover:bg-sky-200/80'
                              : 'text-slate-400 hover:text-slate-600'
                          }
                        >
                          {column.filterType === 'input' ? (
                            <SearchIcon fontSize="small" />
                          ) : (
                            <FilterListIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <TableRow key={rIdx}>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      <Skeleton variant="text" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" className="py-8">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionText={emptyActionText}
                    onAction={onEmptyAction}
                  />
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, rowIdx) => {
                const rowKey = getRowId ? getRowId(row) : row.id || rowIdx;
                return (
                  <TableRow
                    hover
                    key={rowKey}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                          className="py-2.5 text-sm text-slate-700"
                        >
                          {column.render ? column.render(row, rowIdx) : value ?? '—'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Instant Filter Popover */}
      <Popover
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            className: 'rounded-xl shadow-lg border border-slate-200 py-1 min-w-56 overflow-hidden',
          },
        }}
      >
        {filterColumn && (
          <Box className="p-1">
            {/* Popover Header */}
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between gap-2">
              <span>{filterColumn.label}</span>
              {isColumnFiltered(filterColumn) && (
                <button
                  type="button"
                  onClick={() => {
                    if (filterColumn.filterType === 'input') {
                      setInputValue('');
                    }
                    triggerFilter(filterColumn.id, undefined);
                    setFilterAnchor(null);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 font-normal normal-case cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Type 1: INPUT SEARCH */}
            {filterColumn.filterType === 'input' && (
              <Box className="p-2 space-y-2">
                <TextField
                  size="small"
                  autoFocus
                  fullWidth
                  placeholder={
                    filterColumn.filterPlaceholder ||
                    `Tìm theo ${filterColumn.label.toLowerCase()}...`
                  }
                  value={inputValue}
                  onChange={(e) => {
                    const text = e.target.value;
                    setInputValue(text);
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    debounceTimerRef.current = setTimeout(() => {
                      triggerFilter(filterColumn.id, text.trim() || undefined);
                    }, 400);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                      }
                      triggerFilter(filterColumn.id, inputValue.trim() || undefined);
                      setFilterAnchor(null);
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" className="text-slate-400" />
                        </InputAdornment>
                      ),
                      endAdornment: inputValue ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (debounceTimerRef.current) {
                                clearTimeout(debounceTimerRef.current);
                              }
                              setInputValue('');
                              triggerFilter(filterColumn.id, undefined);
                            }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                />
                <div className="text-[11px] text-slate-400 px-1">
                  Nhập để tự động tìm hoặc bấm Enter
                </div>
              </Box>
            )}

            {/* Type 2: SELECT (Single Choice - click là lọc luôn) */}
            {(filterColumn.filterType === 'select' ||
              (!filterColumn.filterType && !filterColumn.filterMultiple)) && (
              <Box className="py-1">
                {/* Option Tất cả */}
                <button
                  type="button"
                  onClick={() => {
                    triggerFilter(filterColumn.id, undefined);
                    setFilterAnchor(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                    !isColumnFiltered(filterColumn)
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả</span>
                  {!isColumnFiltered(filterColumn) && (
                    <CheckIcon fontSize="small" className="text-sky-700" />
                  )}
                </button>

                {/* Danh sách options */}
                {filterColumn.filters?.map((filterItem) => {
                  const currentValue = getColumnFilterValue(filterColumn);
                  const isSelected = currentValue === filterItem.value;

                  return (
                    <button
                      type="button"
                      key={String(filterItem.value)}
                      onClick={() => {
                        const nextVal = isSelected ? undefined : filterItem.value;
                        triggerFilter(filterColumn.id, nextVal);
                        setFilterAnchor(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 text-sky-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{filterItem.text}</span>
                      {isSelected && (
                        <CheckIcon fontSize="small" className="text-sky-700" />
                      )}
                    </button>
                  );
                })}
              </Box>
            )}

            {/* Type 3: CHECKBOX (Multi-select - chọn là lọc luôn) */}
            {(filterColumn.filterType === 'checkbox' || filterColumn.filterMultiple) && (
              <Box className="py-1">
                {filterColumn.filters?.map((filterItem) => {
                  const currentList = Array.isArray(getColumnFilterValue(filterColumn))
                    ? (getColumnFilterValue(filterColumn) as ColumnFilterValue[])
                    : [];
                  const isChecked = currentList.includes(filterItem.value as ColumnFilterValue);

                  return (
                    <Box
                      component="label"
                      key={String(filterItem.value)}
                      className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                    >
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...currentList, filterItem.value as ColumnFilterValue]
                            : currentList.filter((v) => v !== filterItem.value);
                          triggerFilter(
                            filterColumn.id,
                            next.length > 0 ? next : undefined,
                          );
                        }}
                      />
                      <Typography variant="body2" className="text-slate-700">
                        {filterItem.text}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Popover>

      {pagination && (
        <Box className="border-t border-slate-100 flex items-center justify-end bg-white">
          <TablePagination
            component="div"
            count={pagination.total}
            page={Math.max(0, pagination.page - 1)} // MUI is 0-indexed, backend is 1-indexed
            rowsPerPage={pagination.limit}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} trên ${count !== -1 ? count : `hơn ${to}`}`
            }
            onPageChange={(_event, newPage) => {
              handlePageChange(newPage + 1);
            }}
            onRowsPerPageChange={(event) => {
              handleLimitChange(parseInt(event.target.value, 10));
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
