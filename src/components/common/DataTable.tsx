// src/components/common/DataTable.tsx
import React, { ReactNode } from 'react';
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
} from '@mui/material';
import { EmptyState } from './EmptyState';
import { PaginationMeta } from '@/types';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  render?: (row: T, index: number) => ReactNode;
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
                  {column.label}
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
            ) : rows.length === 0 ? (
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
              rows.map((row, rowIdx) => {
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
