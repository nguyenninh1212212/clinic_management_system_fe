// src/components/common/DataTable.tsx
import React, { ReactNode, useState } from 'react';
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
  Menu,
  Tooltip,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { EmptyState } from './EmptyState';
import { PaginationMeta } from '@/types';

export type ColumnFilterValue = string | number | boolean;

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  render?: (row: T, index: number) => ReactNode;
  filters?: Array<{ text: string; value: ColumnFilterValue }>;
  onFilter?: (value: ColumnFilterValue, row: T) => boolean;
  filterMultiple?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  pagination?: PaginationMeta;
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
  const [selectedFilters, setSelectedFilters] = useState<Record<string, ColumnFilterValue[]>>({});
  const [draftFilters, setDraftFilters] = useState<ColumnFilterValue[]>([]);

  const filterColumn = columns.find((column) => column.id === filterColumnId);
  const filteredRows = rows.filter((row) =>
    Object.entries(selectedFilters).every(([columnId, values]) => {
      if (values.length === 0) return true;
      const column = columns.find((item) => item.id === columnId);
      if (!column) return true;
      return values.some((value) =>
        column.onFilter
          ? column.onFilter(value, row)
          : row[column.id] === value,
      );
    }),
  );

  const openFilter = (event: React.MouseEvent<HTMLElement>, column: Column<T>) => {
    setFilterAnchor(event.currentTarget);
    setFilterColumnId(column.id);
    setDraftFilters(selectedFilters[column.id] || []);
  };

  const applyFilters = () => {
    if (filterColumnId) {
      setSelectedFilters((current) => {
        const next = { ...current };
        if (draftFilters.length > 0) next[filterColumnId] = draftFilters;
        else delete next[filterColumnId];
        return next;
      });
    }
    setFilterAnchor(null);
  };

  const clearFilter = () => {
    setDraftFilters([]);
    if (filterColumnId) {
      setSelectedFilters((current) => {
        const next = { ...current };
        delete next[filterColumnId];
        return next;
      });
    }
    setFilterAnchor(null);
  };

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
                    {column.filters && column.filters.length > 0 && (
                      <Tooltip title={`Lọc theo ${column.label}`}>
                        <IconButton
                          size="small"
                          aria-label={`Lọc theo ${column.label}`}
                          onClick={(event) => openFilter(event, column)}
                          className={selectedFilters[column.id]?.length ? 'text-sky-700' : 'text-slate-400'}
                        >
                          <FilterListIcon fontSize="small" />
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
            ) : filteredRows.length === 0 ? (
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
              filteredRows.map((row, rowIdx) => {
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

      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <Box className="min-w-52 py-1">
          {filterColumn?.filters?.map((filter) => (
            <Box
              component="label"
              key={String(filter.value)}
              className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-slate-50"
            >
              <Checkbox
                size="small"
                checked={draftFilters.includes(filter.value)}
                onChange={(event) => {
                  if (filterColumn.filterMultiple === false) {
                    setDraftFilters(event.target.checked ? [filter.value] : []);
                    return;
                  }
                  setDraftFilters((current) =>
                    event.target.checked
                      ? [...current, filter.value]
                      : current.filter((value) => value !== filter.value),
                  );
                }}
              />
              <Typography variant="body2">{filter.text}</Typography>
            </Box>
          ))}
          <Box className="flex justify-between gap-2 border-t border-slate-100 px-3 pt-2 mt-1">
            <Button size="small" color="inherit" onClick={clearFilter}>
              Xóa
            </Button>
            <Button size="small" variant="contained" onClick={applyFilters}>
              Lọc
            </Button>
          </Box>
        </Box>
      </Menu>

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
              if (onPageChange) onPageChange(newPage + 1);
            }}
            onRowsPerPageChange={(event) => {
              if (onLimitChange) onLimitChange(parseInt(event.target.value, 10));
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
