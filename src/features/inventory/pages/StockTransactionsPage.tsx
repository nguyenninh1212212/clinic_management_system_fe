// src/features/inventory/pages/StockTransactionsPage.tsx
import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/endpoints/inventory.api';
import { queryKeys } from '@/api/queryKeys';
import { StockTransaction, StockTransactionType } from '@/types';
import dayjs from 'dayjs';

export const StockTransactionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [transactionType, setTransactionType] = useState<StockTransactionType | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.stockTransactions.list({
      page,
      limit,
      transactionType: transactionType || undefined,
    }),
    queryFn: () =>
      inventoryApi.findAllTransactions({
        page,
        limit,
        transactionType: transactionType || undefined,
      }),
    staleTime: 30_000,
  });

  const getTransactionTypeChip = (txType: StockTransactionType) => {
    switch (txType) {
      case StockTransactionType.IN:
        return (
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
            + Nhập kho (IN)
          </span>
        );
      case StockTransactionType.OUT:
        return (
          <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
            - Xuất kho (OUT)
          </span>
        );
      case StockTransactionType.ADJUSTMENT:
        return (
          <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
            ± Điều chỉnh kiểm kê
          </span>
        );
      case StockTransactionType.EXPIRED:
        return (
          <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
            ✕ Hết hạn / Hỏng
          </span>
        );
      case StockTransactionType.RETURN:
        return (
          <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
            ↩ Hoàn trả kho
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{txType}</span>;
    }
  };

  const columns: Column<StockTransaction>[] = [
    {
      id: 'id',
      label: 'Mã GD',
      minWidth: 80,
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.id}</span>,
    },
    {
      id: 'inventoryId',
      label: 'Mã lô tồn kho',
      minWidth: 160,
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 font-semibold">
          #{row.inventoryId.slice(0, 8)}
        </span>
      ),
    },
    {
      id: 'transactionType',
      label: 'Loại nghiệp vụ',
      minWidth: 160,
      render: (row) => getTransactionTypeChip(row.transactionType),
    },
    {
      id: 'quantity',
      label: 'Số lượng biến động',
      minWidth: 140,
      render: (row) => {
        const isPositive =
          row.transactionType === StockTransactionType.IN ||
          row.transactionType === StockTransactionType.RETURN;
        return (
          <span
            className={`font-bold tabular-nums text-sm ${
              isPositive ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isPositive ? `+${row.quantity}` : `-${row.quantity}`}
          </span>
        );
      },
    },
    {
      id: 'balance',
      label: 'Tồn kho (Trước → Sau)',
      minWidth: 170,
      render: (row) => (
        <span className="text-xs tabular-nums text-slate-600 font-mono">
          {row.balanceBefore ?? '—'} → <strong className="text-slate-800">{row.balanceAfter ?? '—'}</strong>
        </span>
      ),
    },
    {
      id: 'referenceId',
      label: 'Chứng từ liên quan',
      minWidth: 150,
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {row.referenceId || '—'}
        </span>
      ),
    },
    {
      id: 'note',
      label: 'Ghi chú',
      minWidth: 180,
      render: (row) => <span className="text-xs text-slate-600">{row.note || '—'}</span>,
    },
    {
      id: 'createdAt',
      label: 'Thời gian thực hiện',
      minWidth: 140,
      render: (row) => (
        <span className="text-xs tabular-nums text-slate-500">
          {dayjs(row.createdAt).format('HH:mm DD/MM/YYYY')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lịch sử Giao dịch Kho Dược"
        subtitle="Truy vết toàn diện các hoạt động nhập xuất, luân chuyển và điều chỉnh tồn kho thuốc"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Tồn kho dược', href: '/inventory' },
          { label: 'Giao dịch kho' },
        ]}
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <FormControl size="small" className="sm:w-80">
          <InputLabel id="tx-type-label">Phân loại giao dịch</InputLabel>
          <Select
            labelId="tx-type-label"
            value={transactionType}
            label="Phân loại giao dịch"
            onChange={(e) => {
              setTransactionType(e.target.value as StockTransactionType | '');
              setPage(1);
            }}
          >
            <MenuItem value="">Tất cả giao dịch</MenuItem>
            <MenuItem value={StockTransactionType.IN}>Nhập kho dược (IN)</MenuItem>
            <MenuItem value={StockTransactionType.OUT}>Xuất kho cấp phát (OUT)</MenuItem>
            <MenuItem value={StockTransactionType.ADJUSTMENT}>Điều chỉnh kiểm kê</MenuItem>
            <MenuItem value={StockTransactionType.EXPIRED}>Hết hạn / Tiêu hủy</MenuItem>
            <MenuItem value={StockTransactionType.RETURN}>Hoàn trả kho</MenuItem>
          </Select>
        </FormControl>

        <div className="text-xs text-slate-500 tabular-nums">
          Tổng cộng: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> giao dịch
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        emptyTitle="Chưa có dữ liệu giao dịch kho"
        emptyDescription="Các thao tác nhập kho và xuất cấp phát đơn thuốc sẽ tự động lưu vết tại đây."
      />
    </div>
  );
};
