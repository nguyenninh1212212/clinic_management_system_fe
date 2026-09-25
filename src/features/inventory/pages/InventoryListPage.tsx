// src/features/inventory/pages/InventoryListPage.tsx
import React, { useState } from 'react';
import {
  Button,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  useInventory,
  useCreateInventory,
  useStockTransaction,
  useDeleteInventory,
} from '../hooks/useInventory';
import { useMedicinesAll } from '@/features/medicines/hooks/useMedicines';
import { InventoryItem, StockTransactionType } from '@/types';
import dayjs from 'dayjs';

export const InventoryListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // New Batch Dialog State
  const [newBatchOpen, setNewBatchOpen] = useState(false);
  const [medicineId, setMedicineId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [expiryDate, setExpiryDate] = useState(
    dayjs().add(1, 'year').format('YYYY-MM-DD'),
  );
  const [minStockLevel, setMinStockLevel] = useState(20);
  const [maxStockLevel, setMaxStockLevel] = useState(500);
  const [unitPrice, setUnitPrice] = useState(5000);

  // Transaction Dialog State
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [txType, setTxType] = useState<StockTransactionType>(StockTransactionType.IMPORT);
  const [txQuantity, setTxQuantity] = useState(10);
  const [txReason, setTxReason] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useInventory({
    page,
    limit,
    search: search || undefined,
    lowStock: lowStockOnly ? true : undefined,
  });

  const { data: medicinesList } = useMedicinesAll();

  const createBatchMutation = useCreateInventory();
  const txMutation = useStockTransaction();
  const deleteMutation = useDeleteInventory();

  const handleOpenTransaction = (item: InventoryItem) => {
    setSelectedItem(item);
    setTxType(StockTransactionType.IMPORT);
    setTxQuantity(10);
    setTxReason('');
    setTxDialogOpen(true);
  };

  const handleCreateBatch = async () => {
    if (!medicineId || !batchNumber || quantity <= 0) return;
    try {
      await createBatchMutation.mutateAsync({
        medicineId,
        batchNumber,
        quantity,
        expiryDate: new Date(expiryDate).toISOString(),
        minStockLevel,
        maxStockLevel,
        unitPrice,
      });
      setNewBatchOpen(false);
    } catch {
      // Handled by interceptor
    }
  };

  const handleExecuteTransaction = async () => {
    if (!selectedItem || txQuantity <= 0) return;
    try {
      await txMutation.mutateAsync({
        medicineId: selectedItem.medicineId,
        type: txType,
        quantity: txQuantity,
        reason: txReason || undefined,
      });
      setTxDialogOpen(false);
    } catch {
      // Handled by interceptor
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Handled by interceptor
    }
  };

  const getExpiryStatus = (dateStr: string) => {
    const exp = dayjs(dateStr);
    const now = dayjs();
    const diffDays = exp.diff(now, 'day');

    if (diffDays <= 0) {
      return (
        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          ĐÃ HẾT HẠN
        </span>
      );
    }
    if (diffDays <= 90) {
      return (
        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Cận hạn ({diffDays} ngày)
        </span>
      );
    }
    return (
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
        Còn hạn ({diffDays} ngày)
      </span>
    );
  };

  const columns: Column<InventoryItem>[] = [
    {
      id: 'batchNumber',
      label: 'Số lô (Batch)',
      minWidth: 120,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
          {row.batchNumber}
        </span>
      ),
    },
    {
      id: 'medicine',
      label: 'Thuốc / Biệt dược',
      minWidth: 200,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">
            {row.medicine?.name || 'Thuốc'}
          </div>
          <div className="text-xs text-slate-500">
            {row.medicine?.activeIngredient} {row.medicine?.strength && `· ${row.medicine?.strength}`}
          </div>
        </div>
      ),
    },
    {
      id: 'quantity',
      label: 'Tồn kho / Tối thiểu',
      minWidth: 160,
      render: (row) => {
        const isLow = row.quantity <= (row.minStockLevel || 10);
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-bold tabular-nums text-sm ${
                  isLow ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {row.quantity.toLocaleString('vi-VN')} {row.medicine?.unit || 'viên'}
              </span>
              {isLow && (
                <Tooltip title="Cảnh báo: Tồn kho đang dưới ngưỡng an toàn tối thiểu!">
                  <WarningAmberIcon fontSize="small" className="text-rose-500" />
                </Tooltip>
              )}
            </div>
            <div className="text-[11px] text-slate-400 tabular-nums">
              Tối thiểu: {row.minStockLevel || 10} · Tối đa: {row.maxStockLevel || 500}
            </div>
          </div>
        );
      },
    },
    {
      id: 'unitPrice',
      label: 'Đơn giá nhập',
      minWidth: 130,
      render: (row) => (
        <span className="tabular-nums font-mono text-xs text-slate-700 font-semibold">
          {row.unitPrice ? `${Number(row.unitPrice).toLocaleString('vi-VN')} đ` : '—'}
        </span>
      ),
    },
    {
      id: 'expiryDate',
      label: 'Hạn dùng (EXP)',
      minWidth: 160,
      render: (row) => (
        <div>
          <div className="text-xs font-mono tabular-nums text-slate-800">
            {dayjs(row.expiryDate).format('DD/MM/YYYY')}
          </div>
          <div className="mt-0.5">{getExpiryStatus(row.expiryDate)}</div>
        </div>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác kho',
      align: 'right',
      minWidth: 140,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="small"
            variant="outlined"
            startIcon={<SwapHorizIcon />}
            onClick={() => handleOpenTransaction(row)}
            className="text-xs"
          >
            Xuất / Nhập
          </Button>
          <Tooltip title="Xóa lô">
            <IconButton
              size="small"
              onClick={() => setDeleteId(row.id)}
              className="text-slate-400 hover:text-rose-600"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý Kho Dược & Tồn kho"
        subtitle="Theo dõi số lô, hạn sử dụng, ngưỡng cảnh báo tồn kho và xuất nhập thuốc"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Kho dược' }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewBatchOpen(true)}
          >
            Nhập lô thuốc mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <SearchInput
            placeholder="Tìm theo số lô hoặc tên thuốc..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            className="sm:w-80"
          />

          <FormControlLabel
            control={
              <Switch
                checked={lowStockOnly}
                onChange={(e) => {
                  setLowStockOnly(e.target.checked);
                  setPage(1);
                }}
                color="error"
              />
            }
            label={
              <span className="text-xs font-semibold text-rose-700">
                Chỉ hiển thị thuốc sắp hết hàng
              </span>
            }
          />
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> lô thuốc
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
        emptyTitle="Kho dược trống hoặc không có kết quả phù hợp"
        emptyDescription="Nhập lô thuốc mới để bắt đầu theo dõi tồn kho và hạn dùng."
        emptyActionText="Nhập lô thuốc đầu tiên"
        onEmptyAction={() => setNewBatchOpen(true)}
      />

      {/* New Batch Dialog */}
      <Dialog
        open={newBatchOpen}
        onClose={() => setNewBatchOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          Nhập lô thuốc mới vào kho
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <FormControl fullWidth size="small">
            <InputLabel id="batch-med-label">Chọn thuốc *</InputLabel>
            <Select
              labelId="batch-med-label"
              value={medicineId}
              label="Chọn thuốc *"
              onChange={(e) => setMedicineId(e.target.value)}
            >
              {medicinesList?.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name} ({m.strength || m.unit})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Số lô sản xuất (Batch No.) *"
              size="small"
              placeholder="LOT2026-001"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
            />

            <TextField
              label="Hạn sử dụng (EXP) *"
              type="date"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />

            <TextField
              label="Số lượng nhập *"
              type="number"
              size="small"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <TextField
              label="Đơn giá nhập (VNĐ)"
              type="number"
              size="small"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
            />

            <TextField
              label="Ngưỡng tối thiểu (Min)"
              type="number"
              size="small"
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(Number(e.target.value))}
            />

            <TextField
              label="Ngưỡng tối đa (Max)"
              type="number"
              size="small"
              value={maxStockLevel}
              onChange={(e) => setMaxStockLevel(Number(e.target.value))}
            />
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setNewBatchOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleCreateBatch}
            variant="contained"
            disabled={!medicineId || !batchNumber || createBatchMutation.isPending}
          >
            {createBatchMutation.isPending ? 'Đang lưu...' : 'Nhập kho lô này'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Transaction Dialog */}
      <Dialog
        open={txDialogOpen}
        onClose={() => setTxDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          Giao dịch Xuất / Nhập / Điều chỉnh kho
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          {selectedItem && (
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>
                Thuốc: <strong>{selectedItem.medicine?.name}</strong>
              </div>
              <div>
                Lô: <strong className="font-mono">{selectedItem.batchNumber}</strong>
              </div>
              <div>
                Tồn hiện tại: <strong>{selectedItem.quantity} {selectedItem.medicine?.unit}</strong>
              </div>
            </div>
          )}

          <FormControl fullWidth size="small">
            <InputLabel id="tx-type-label">Loại giao dịch *</InputLabel>
            <Select
              labelId="tx-type-label"
              value={txType}
              label="Loại giao dịch *"
              onChange={(e) => setTxType(e.target.value as StockTransactionType)}
            >
              <MenuItem value={StockTransactionType.IMPORT}>Nhập thêm kho (+)</MenuItem>
              <MenuItem value={StockTransactionType.EXPORT}>Xuất kho (-)</MenuItem>
              <MenuItem value={StockTransactionType.ADJUSTMENT}>Điều chỉnh kiểm kê (±)</MenuItem>
              <MenuItem value={StockTransactionType.DISPOSAL}>Hủy thuốc hỏng / hết hạn (-)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Số lượng *"
            type="number"
            size="small"
            fullWidth
            value={txQuantity}
            onChange={(e) => setTxQuantity(Number(e.target.value))}
          />

          <TextField
            label="Lý do / Căn cứ chứng từ"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={txReason}
            onChange={(e) => setTxReason(e.target.value)}
            placeholder="VD: Phiếu xuất số 12, kiểm kê định kỳ..."
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setTxDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleExecuteTransaction}
            variant="contained"
            disabled={txQuantity <= 0 || txMutation.isPending}
          >
            {txMutation.isPending ? 'Đang thực hiện...' : 'Xác nhận giao dịch'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Xóa lô thuốc khỏi kho?"
        content="Bạn có chắc muốn xóa bản ghi lô thuốc này? Lưu ý: Kiểm tra giao dịch liên quan trước khi xóa."
        confirmText="Xóa lô"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
