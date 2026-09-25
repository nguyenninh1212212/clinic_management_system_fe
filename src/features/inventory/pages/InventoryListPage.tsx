
import React, { useState } from "react";

import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import {
  useInventory,
  useCreateInventory,
  useStockTransaction,
  useDeleteInventory,
} from "../hooks/useInventory";

import { useMedicinesAll } from "@/features/medicines/hooks/useMedicines";
import { Inventory, StockTransactionType } from "@/types";
import dayjs from "dayjs";

export const InventoryListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // =========================
  // New Batch Form
  // =========================

  const [newBatchOpen, setNewBatchOpen] = useState(false);

  const [medicineId, setMedicineId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  const [quantity, setQuantity] = useState(100);

  const [expiryDate, setExpiryDate] = useState(
    dayjs().add(1, "year").format("YYYY-MM-DD"),
  );

  const [minStockLevel, setMinStockLevel] = useState(20);
  const [maxStockLevel, setMaxStockLevel] = useState(500);

  const [unitPrice, setUnitPrice] = useState(5000);

  const [warehouseLocation, setWarehouseLocation] = useState("");

  // =========================
  // Transaction Form
  // =========================

  const [txDialogOpen, setTxDialogOpen] = useState(false);

  const [selectedItem, setSelectedItem] =
    useState<Inventory | null>(null);

  const [txType, setTxType] = useState<StockTransactionType>(
    StockTransactionType.IN,
  );

  const [txQuantity, setTxQuantity] = useState(10);

  const [txReason, setTxReason] = useState("");

  // =========================
  // Delete
  // =========================

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // =========================
  // Queries / Mutations
  // =========================

  const { data, isLoading } = useInventory({
    page,
    limit,
    search: search || undefined,
    lowStock: lowStockOnly ? true : undefined,
  });

  const { data: medicinesList } = useMedicinesAll();

  const createInventoryMutation = useCreateInventory();
  const txMutation = useStockTransaction();
  const deleteMutation = useDeleteInventory();

  // =========================
  // Transaction
  // =========================

  const handleOpenTransaction = (item: Inventory) => {
    setSelectedItem(item);
    setTxType(StockTransactionType.IN);
    setTxQuantity(10);
    setTxReason("");
    setTxDialogOpen(true);
  };

  // =========================
  // New Batch
  // =========================

  const handleCreateBatch = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !medicineId ||
      !batchNumber.trim() ||
      quantity <= 0 ||
      unitPrice < 0
    ) {
      return;
    }

    try {
      await createInventoryMutation.mutateAsync({
        medicineId,
        batchNumber: batchNumber.trim(),
        quantity,
        expiryDate: new Date(expiryDate).toISOString(),
        unitCost: unitPrice,
        warehouseLocation: warehouseLocation.trim() || undefined,
      });

      setNewBatchOpen(false);

      // Reset form
      setMedicineId("");
      setBatchNumber("");
      setQuantity(100);
      setExpiryDate(
        dayjs().add(1, "year").format("YYYY-MM-DD"),
      );
      setMinStockLevel(20);
      setMaxStockLevel(500);
      setUnitPrice(5000);
      setWarehouseLocation("");
    } catch {
      // Handled by interceptor
    }
  };

  // =========================
  // Stock Transaction
  // =========================

  const handleExecuteTransaction = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedItem || txQuantity <= 0) {
      return;
    }

    try {
      await txMutation.mutateAsync({
        inventoryId: selectedItem.id,
        transactionType: txType,
        quantity: txQuantity,
        note: txReason.trim() || undefined,
      });

      setTxDialogOpen(false);
    } catch {
      // Handled by interceptor
    }
  };

  // =========================
  // Delete
  // =========================

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Handled by interceptor
    }
  };

  // =========================
  // Expiry
  // =========================

  const getExpiryStatus = (dateStr: Date) => {
    const exp = dayjs(dateStr);
    const now = dayjs();

    const diffDays = exp.diff(now, "day");

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

  // =========================
  // Table
  // =========================

  const columns: Column<Inventory>[] = [
    {
      id: "batchNumber",
      label: "Số lô (Batch)",
      minWidth: 120,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
          {row.batchNumber}
        </span>
      ),
    },

    {
      id: "medicine",
      label: "Thuốc / Biệt dược",
      minWidth: 200,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">
            {row.medicine?.name || "Thuốc"}
          </div>
        </div>
      ),
    },

    {
      id: "quantity",
      label: "Tồn kho / Tối thiểu",
      minWidth: 160,
      render: (row) => {
        const isLow = row.quantity <= 10;

        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-bold tabular-nums text-sm ${
                  isLow ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {row.quantity.toLocaleString("vi-VN")}{" "}
                {row.medicine?.unit || "viên"}
              </span>

              {isLow && (
                <Tooltip title="Cảnh báo: Tồn kho đang dưới ngưỡng an toàn tối thiểu!">
                  <WarningAmberIcon
                    fontSize="small"
                    className="text-rose-500"
                  />
                </Tooltip>
              )}
            </div>

            <div className="text-[11px] text-slate-400 tabular-nums">
              Tối thiểu: {10} · Tối đa: {500}
            </div>
          </div>
        );
      },
    },

    {
      id: "unitPrice",
      label: "Đơn giá nhập",
      minWidth: 130,
      render: (row) => (
        <span className="tabular-nums font-mono text-xs text-slate-700 font-semibold">
          {row.unitCost
            ? `${Number(row.unitCost).toLocaleString("vi-VN")} đ`
            : "—"}
        </span>
      ),
    },

    {
      id: "expiryDate",
      label: "Hạn dùng (EXP)",
      minWidth: 160,
      render: (row) => (
        <div>
          <div className="text-xs font-mono tabular-nums text-slate-800">
            {dayjs(row.expiryDate).format("DD/MM/YYYY")}
          </div>

          {row.expiryDate && (
            <div className="mt-0.5">
              {getExpiryStatus(row.expiryDate)}
            </div>
          )}
        </div>
      ),
    },

    {
      id: "actions",
      label: "Thao tác kho",
      align: "right",
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
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Kho dược" },
        ]}
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

      {/* Search */}
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
          Tổng số:{" "}
          <strong className="text-slate-800">
            {data?.pagination?.total || 0}
          </strong>{" "}
          lô thuốc
        </div>
      </div>

      {/* Table */}
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

      {/* =====================================================
          NEW BATCH FORM
          ===================================================== */}

      <Dialog
        open={newBatchOpen}
        onClose={() => setNewBatchOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box
          component="form"
          onSubmit={handleCreateBatch}
        >
          <DialogTitle className="font-bold text-slate-900">
            Nhập lô thuốc mới vào kho
          </DialogTitle>

          <DialogContent className="space-y-4 pt-2">
            {/* Medicine */}
            <FormControl
              fullWidth
              size="small"
              required
              error={!medicineId}
            >
              <FormLabel
                htmlFor="batch-medicine"
                className="mb-1"
              >
                Thuốc
              </FormLabel>

              <Select
                id="batch-medicine"
                value={medicineId}
                displayEmpty
                onChange={(e) => setMedicineId(e.target.value)}
              >
                <MenuItem value="" disabled>
                  Chọn thuốc
                </MenuItem>

                {medicinesList?.map((medicine) => (
                  <MenuItem
                    key={medicine.id}
                    value={medicine.id}
                  >
                    {medicine.name} ({medicine.unit})
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {!medicineId && "Vui lòng chọn thuốc"}
              </FormHelperText>
            </FormControl>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
                gap: 2,
              }}
            >
              {/* Batch Number */}
              <FormControl
                fullWidth
                required
                error={!batchNumber.trim()}
              >
                <FormLabel htmlFor="batch-number">
                  Số lô sản xuất
                </FormLabel>

                <TextField
                  id="batch-number"
                  size="small"
                  placeholder="LOT2026-001"
                  value={batchNumber}
                  onChange={(e) =>
                    setBatchNumber(e.target.value)
                  }
                />

                <FormHelperText>
                  {!batchNumber.trim()
                    ? "Vui lòng nhập số lô"
                    : " "}
                </FormHelperText>
              </FormControl>

              {/* Expiry */}
              <FormControl fullWidth required>
                <FormLabel htmlFor="expiry-date">
                  Hạn sử dụng
                </FormLabel>

                <TextField
                  id="expiry-date"
                  type="date"
                  size="small"
                  value={expiryDate}
                  onChange={(e) =>
                    setExpiryDate(e.target.value)
                  }
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                <FormHelperText>
                  Ngày hết hạn của lô thuốc
                </FormHelperText>
              </FormControl>

              {/* Quantity */}
              <FormControl
                fullWidth
                required
                error={quantity <= 0}
              >
                <FormLabel htmlFor="quantity">
                  Số lượng nhập
                </FormLabel>

                <TextField
                  id="quantity"
                  type="number"
                  size="small"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value))
                  }
                  slotProps={{
                    htmlInput: {
                      min: 1,
                    },
                  }}
                />

                <FormHelperText>
                  {quantity <= 0
                    ? "Số lượng phải lớn hơn 0"
                    : "Số lượng thuốc nhập vào kho"}
                </FormHelperText>
              </FormControl>

              {/* Unit Price */}
              <FormControl
                fullWidth
                required
                error={unitPrice < 0}
              >
                <FormLabel htmlFor="unit-price">
                  Đơn giá nhập (VNĐ)
                </FormLabel>

                <TextField
                  id="unit-price"
                  type="number"
                  size="small"
                  value={unitPrice}
                  onChange={(e) =>
                    setUnitPrice(Number(e.target.value))
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
                />

                <FormHelperText>
                  Đơn giá nhập của một đơn vị thuốc
                </FormHelperText>
              </FormControl>

              {/* Min Stock */}
              <FormControl fullWidth>
                <FormLabel htmlFor="min-stock">
                  Ngưỡng tồn tối thiểu
                </FormLabel>

                <TextField
                  id="min-stock"
                  type="number"
                  size="small"
                  value={minStockLevel}
                  onChange={(e) =>
                    setMinStockLevel(Number(e.target.value))
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
                />

                <FormHelperText>
                  Dùng để cảnh báo sắp hết hàng
                </FormHelperText>
              </FormControl>

              {/* Max Stock */}
              <FormControl fullWidth>
                <FormLabel htmlFor="max-stock">
                  Ngưỡng tồn tối đa
                </FormLabel>

                <TextField
                  id="max-stock"
                  type="number"
                  size="small"
                  value={maxStockLevel}
                  onChange={(e) =>
                    setMaxStockLevel(Number(e.target.value))
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
                />

                <FormHelperText>
                  Ngưỡng tồn kho tối đa
                </FormHelperText>
              </FormControl>

              {/* Warehouse Location */}
              <FormControl fullWidth>
                <FormLabel htmlFor="warehouse-location">
                  Vị trí kho
                </FormLabel>

                <TextField
                  id="warehouse-location"
                  size="small"
                  placeholder="VD: Kệ A1 - Tầng 2"
                  value={warehouseLocation}
                  onChange={(e) =>
                    setWarehouseLocation(e.target.value)
                  }
                />

                <FormHelperText>
                  Vị trí lưu trữ thuốc trong kho
                </FormHelperText>
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions className="px-6 pb-4">
            <Button
              type="button"
              onClick={() => setNewBatchOpen(false)}
              color="inherit"
            >
              Hủy
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                !medicineId ||
                !batchNumber.trim() ||
                quantity <= 0 ||
                createInventoryMutation.isPending
              }
            >
              {createInventoryMutation.isPending
                ? "Đang lưu..."
                : "Nhập kho lô này"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* =====================================================
          STOCK TRANSACTION FORM
          ===================================================== */}

      <Dialog
        open={txDialogOpen}
        onClose={() => setTxDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box
          component="form"
          onSubmit={handleExecuteTransaction}
        >
          <DialogTitle className="font-bold text-slate-900">
            Giao dịch Xuất / Nhập / Điều chỉnh kho
          </DialogTitle>

          <DialogContent className="space-y-4 pt-2">
            {selectedItem && (
              <Box className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div>
                  Thuốc:{" "}
                  <strong>
                    {selectedItem.medicine?.name}
                  </strong>
                </div>

                <div>
                  Lô:{" "}
                  <strong className="font-mono">
                    {selectedItem.batchNumber}
                  </strong>
                </div>

                <div>
                  Tồn hiện tại:{" "}
                  <strong>
                    {selectedItem.quantity}{" "}
                    {selectedItem.medicine?.unit}
                  </strong>
                </div>
              </Box>
            )}

            {/* Transaction Type */}
            <FormControl fullWidth size="small" required>
              <FormLabel className="mb-1">
                Loại giao dịch
              </FormLabel>

              <Select
                value={txType}
                onChange={(e) =>
                  setTxType(
                    e.target.value as StockTransactionType,
                  )
                }
              >
                <MenuItem value={StockTransactionType.IN}>
                  Nhập thêm kho (+)
                </MenuItem>

                <MenuItem value={StockTransactionType.OUT}>
                  Xuất kho (-)
                </MenuItem>

                <MenuItem
                  value={StockTransactionType.ADJUSTMENT}
                >
                  Điều chỉnh kiểm kê (±)
                </MenuItem>

                <MenuItem value={StockTransactionType.EXPIRED}>
                  Hủy thuốc hỏng / hết hạn (-)
                </MenuItem>
              </Select>

              <FormHelperText>
                Chọn loại biến động tồn kho
              </FormHelperText>
            </FormControl>

            {/* Quantity */}
            <FormControl
              fullWidth
              required
              error={txQuantity <= 0}
            >
              <FormLabel htmlFor="tx-quantity">
                Số lượng
              </FormLabel>

              <TextField
                id="tx-quantity"
                type="number"
                size="small"
                value={txQuantity}
                onChange={(e) =>
                  setTxQuantity(Number(e.target.value))
                }
                slotProps={{
                  htmlInput: {
                    min: 1,
                  },
                }}
              />

              <FormHelperText>
                {txQuantity <= 0
                  ? "Số lượng phải lớn hơn 0"
                  : "Số lượng thực hiện giao dịch"}
              </FormHelperText>
            </FormControl>

            {/* Reason */}
            <FormControl fullWidth>
              <FormLabel htmlFor="tx-reason">
                Lý do / Căn cứ chứng từ
              </FormLabel>

              <TextField
                id="tx-reason"
                size="small"
                multiline
                rows={2}
                value={txReason}
                onChange={(e) =>
                  setTxReason(e.target.value)
                }
                placeholder="VD: Phiếu xuất số 12, kiểm kê định kỳ..."
              />

              <FormHelperText>
                Có thể nhập số phiếu hoặc lý do điều chỉnh
              </FormHelperText>
            </FormControl>
          </DialogContent>

          <DialogActions className="px-6 pb-4">
            <Button
              type="button"
              onClick={() => setTxDialogOpen(false)}
              color="inherit"
            >
              Hủy
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                !selectedItem ||
                txQuantity <= 0 ||
                txMutation.isPending
              }
            >
              {txMutation.isPending
                ? "Đang thực hiện..."
                : "Xác nhận giao dịch"}
            </Button>
          </DialogActions>
        </Box>
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
