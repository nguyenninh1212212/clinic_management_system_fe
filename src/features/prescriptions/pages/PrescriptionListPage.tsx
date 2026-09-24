// src/features/prescriptions/pages/PrescriptionListPage.tsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { usePrescriptions, useCreatePrescription, useDeletePrescription } from '../hooks/usePrescriptions';
import { useExaminations } from '@/features/examinations/hooks/useExaminations';
import { useMedicinesDropdown } from '@/features/medicines/hooks/useMedicines';
import { Prescription, CreatePrescriptionItemDto, Medicine } from '@/types';
import dayjs from 'dayjs';

export const PrescriptionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedExamId = searchParams.get('examinationId') || '';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Create Prescription Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(Boolean(preselectedExamId));
  const [selectedExamId, setSelectedExamId] = useState<string>(preselectedExamId);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreatePrescriptionItemDto[]>([
    {
      medicineId: '',
      quantity: 10,
      dosage: '1 viên/lần',
      frequency: '2 lần/ngày (sau ăn)',
      duration: '5 ngày',
      durationDays: 5,
      note: '',
      instructions: '',
    },
  ]);

  const { data, isLoading } = usePrescriptions({
    page,
    limit,
    search: search || undefined,
  });

  const { data: examsData } = useExaminations({ limit: 50 });
  const { data: medicinesData } = useMedicinesDropdown(100);

  const createMutation = useCreatePrescription();
  const deleteMutation = useDeletePrescription();

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        medicineId: '',
        quantity: 10,
        dosage: '1 viên/lần',
        frequency: '2 lần/ngày (sau ăn)',
        duration: '5 ngày',
        durationDays: 5,
        note: '',
        instructions: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof CreatePrescriptionItemDto, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleCreateSubmit = async () => {
    if (!selectedExamId || items.some((i) => !i.medicineId || i.quantity <= 0)) {
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        examinationId: selectedExamId,
        notes: notes || undefined,
        items,
      });
      setCreateDialogOpen(false);
      navigate(`/prescriptions/${created.id}`);
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

  const columns: Column<Prescription>[] = [
    {
      id: 'id',
      label: 'Mã đơn',
      minWidth: 80,
      render: (row) => <span className="font-mono text-slate-500 tabular-nums">#{row.id.slice(0, 8)}</span>,
    },
    {
      id: 'patient',
      label: 'Bệnh nhân',
      minWidth: 180,
      render: (row) => (
        <div>
          <button
            onClick={() => navigate(`/prescriptions/${row.id}`)}
            className="font-semibold text-sky-700 hover:underline text-left text-sm"
          >
            {row.examination?.appointment?.patient?.fullName || 'Bệnh nhân'}
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {row.examination?.appointment?.patient?.phone}
          </span>
        </div>
      ),
    },
    {
      id: 'doctor',
      label: 'Bác sĩ kê đơn',
      minWidth: 160,
      render: (row) => (
        <span className="text-slate-700 font-medium">
          {row.examination?.doctor?.user?.fullName || 'Bác sĩ điều trị'}
        </span>
      ),
    },
    {
      id: 'diagnosis',
      label: 'Chẩn đoán xác định',
      minWidth: 200,
      render: (row) => (
        <span className="text-slate-700 text-xs line-clamp-1">
          {row.examination?.diagnosis || '—'}
        </span>
      ),
    },
    {
      id: 'itemCount',
      label: 'Số vị thuốc',
      minWidth: 110,
      render: (row) => (
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded tabular-nums">
          {row.items?.length || 0} loại thuốc
        </span>
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày kê đơn',
      minWidth: 130,
      render: (row) => (
        <span className="text-xs tabular-nums text-slate-500">
          {dayjs(row.createdAt).format('HH:mm DD/MM/YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 120,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Xem & In đơn thuốc">
            <IconButton
              size="small"
              onClick={() => navigate(`/prescriptions/${row.id}`)}
              className="text-slate-500 hover:text-sky-600"
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Xóa đơn thuốc">
            <IconButton
              size="small"
              onClick={() => setDeleteId(row.id)}
              className="text-slate-500 hover:text-rose-600"
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh sách Đơn thuốc"
        subtitle="Quản lý đơn thuốc ngoại trú, liều dùng và hướng dẫn sử dụng dược phẩm"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Đơn thuốc' }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Kê đơn thuốc mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
        <SearchInput
          placeholder="Tìm theo mã đơn hoặc chẩn đoán..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-500 tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> đơn thuốc
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
        emptyTitle="Chưa có đơn thuốc nào"
        emptyDescription="Tạo đơn thuốc liên kết với phiếu khám bệnh của bệnh nhân."
        emptyActionText="Kê đơn thuốc mới"
        onEmptyAction={() => setCreateDialogOpen(true)}
      />

      {/* Create Prescription Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          Kê đơn thuốc cho bệnh nhân
        </DialogTitle>
        <DialogContent className="space-y-5 pt-2">
          {createMutation.isError && (
            <Alert severity="error">
              {(createMutation.error as any)?.response?.data?.message ||
                'Có lỗi xảy ra khi tạo đơn thuốc. Lưu ý: Mỗi phiếu khám chỉ có 1 đơn thuốc duy nhất.'}
            </Alert>
          )}

          <FormControl fullWidth size="small">
            <InputLabel id="exam-select-label">Phiếu khám bệnh liên kết *</InputLabel>
            <Select
              labelId="exam-select-label"
              value={selectedExamId}
              label="Phiếu khám bệnh liên kết *"
              onChange={(e) => setSelectedExamId(e.target.value)}
            >
              {examsData?.data?.map((ex) => (
                <MenuItem key={ex.id} value={ex.id}>
                  {ex.appointment?.patient?.fullName} — Chẩn đoán: {ex.diagnosis} ({dayjs(ex.createdAt).format('DD/MM')})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Lời dặn chung / Ghi chú đơn thuốc"
            fullWidth
            size="small"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="VD: Kiêng đồ cay nóng, uống nhiều nước ấm, tái khám sau 5 ngày..."
          />

          {/* Medicines list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Danh mục thuốc kê ({items.length} loại)
              </span>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem}>
                Thêm thuốc
              </Button>
            </div>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-800">
                    Thuốc #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      <RemoveCircleOutlinedIcon fontSize="small" />
                    </IconButton>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <FormControl fullWidth size="small">
                      <InputLabel id={`med-select-${idx}`}>Chọn biệt dược *</InputLabel>
                      <Select
                        labelId={`med-select-${idx}`}
                        value={item.medicineId}
                        label="Chọn biệt dược *"
                        onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
                      >
                        {medicinesData?.data?.map((m: Medicine) => (
                          <MenuItem key={m.id} value={m.id}>
                            {m.name} ({m.strength || m.unit})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>

                  <div>
                    <TextField
                      label="Số lượng *"
                      type="number"
                      size="small"
                      fullWidth
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, 'quantity', Number(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <TextField
                      label="Liều dùng"
                      size="small"
                      fullWidth
                      value={item.dosage}
                      onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                      placeholder="1 viên/lần"
                    />
                  </div>

                  <div>
                    <TextField
                      label="Tần suất dùng"
                      size="small"
                      fullWidth
                      value={item.frequency}
                      onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                      placeholder="2 lần/ngày (sáng, tối)"
                    />
                  </div>

                  <div>
                    <TextField
                      label="Số ngày dùng"
                      type="number"
                      size="small"
                      fullWidth
                      value={item.durationDays || 5}
                      onChange={(e) => {
                        const days = Number(e.target.value);
                        handleItemChange(idx, 'durationDays', days);
                        handleItemChange(idx, 'duration', `${days} ngày`);
                      }}
                      placeholder="5"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <TextField
                      label="Hướng dẫn uống chi tiết"
                      size="small"
                      fullWidth
                      value={item.instructions || ''}
                      onChange={(e) => {
                        handleItemChange(idx, 'instructions', e.target.value);
                        handleItemChange(idx, 'note', e.target.value);
                      }}
                      placeholder="Uống sau bữa ăn 30 phút với nhiều nước..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={!selectedExamId || createMutation.isPending}
          >
            {createMutation.isPending ? 'Đang lưu...' : 'Xác nhận tạo đơn thuốc'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa đơn thuốc?"
        content="Bạn có chắc muốn xóa đơn thuốc này? Thao tác không thể hoàn tác."
        confirmText="Xóa đơn thuốc"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
