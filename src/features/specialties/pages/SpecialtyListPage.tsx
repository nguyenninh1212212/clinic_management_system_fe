// src/features/specialties/pages/SpecialtyListPage.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MaterialIconPicker, renderMaterialIcon } from '@/components/common/MaterialIconPicker';
import {
  useSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
} from '../hooks/useSpecialties';
import { specialtySchema, SpecialtyFormValues } from '../schemas/specialty.schema';
import { usePermission } from '@/hooks/usePermission';
import { Specialty } from '@/types';

export const SpecialtyListPage: React.FC = () => {
  const { canManageSpecialties, canDeleteSpecialty } = usePermission();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const { data, isLoading } = useSpecialties({
    page,
    limit,
    search: search || undefined,
  });

  const createMutation = useCreateSpecialty();
  const updateMutation = useUpdateSpecialty();
  const deleteMutation = useDeleteSpecialty();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SpecialtyFormValues>({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      name: '',
      description: '',
      iconUrl: '',
    },
  });

  const iconUrlWatch = watch('iconUrl');

  const handleOpenCreate = () => {
    setEditingSpecialty(null);
    reset({ name: '', description: '', iconUrl: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    reset({
      name: specialty.name,
      description: specialty.description || '',
      iconUrl: specialty.iconUrl || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: SpecialtyFormValues) => {
    try {
      if (editingSpecialty) {
        await updateMutation.mutateAsync({
          id: editingSpecialty.id,
          dto: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      setDialogOpen(false);
    } catch {
      // Handled by interceptor
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Handled by interceptor
    }
  };

  const columns: Column<Specialty>[] = [
    {
      id: 'id',
      label: 'Mã',
      minWidth: 70,
      render: (row) => <span className="font-mono text-slate-500 tabular-nums">#{row.id}</span>,
    },
    {
      id: 'icon',
      label: 'Biểu tượng',
      minWidth: 90,
      render: (row) => (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
          }}
        >
          {renderMaterialIcon(row.iconUrl) ?? <LocalHospitalIcon fontSize="small" />}
        </Box>
      ),
    },
    {
      id: 'name',
      label: 'Tên chuyên khoa',
      minWidth: 200,
      render: (row) => <span className="font-semibold text-slate-800">{row.name}</span>,
    },
    {
      id: 'description',
      label: 'Mô tả chuyên khoa',
      minWidth: 300,
      render: (row) => (
        <span className="text-slate-600 text-xs line-clamp-2">{row.description || '—'}</span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 100,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {canManageSpecialties && (
            <Tooltip title="Chỉnh sửa">
              <IconButton
                size="small"
                onClick={() => handleOpenEdit(row)}
                className="text-slate-500 hover:text-amber-600"
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canDeleteSpecialty && (
            <Tooltip title="Xóa chuyên khoa">
              <IconButton
                size="small"
                onClick={() => {
                  setDeleteId(row.id);
                  setDeleteName(row.name);
                }}
                className="text-slate-500 hover:text-rose-600"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh mục Chuyên khoa"
        subtitle="Quản trị các chuyên khoa khám chữa bệnh tại cơ sở y tế"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Chuyên khoa' }]}
        action={
          canManageSpecialties && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Thêm chuyên khoa
            </Button>
          )
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
        <SearchInput
          placeholder="Tìm tên chuyên khoa..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-500 tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> chuyên khoa
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
        emptyTitle="Chưa có chuyên khoa nào"
        emptyDescription="Thêm chuyên khoa như Nội khoa, Ngoại khoa, Nhi khoa, Tai mũi họng..."
        emptyActionText={canManageSpecialties ? 'Thêm chuyên khoa mới' : undefined}
        onEmptyAction={handleOpenCreate}
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          {editingSpecialty ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa mới'}
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-4 mt-2  ">
            <TextField
              label="Tên chuyên khoa *"
              fullWidth
              variant="filled"
              size="small"
              sx={{ mt: 1 }}
              placeholder="VD: Tim mạch, Tiêu hóa, Thần kinh..."
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <MaterialIconPicker
              value={iconUrlWatch}
              onChange={(name) => setValue('iconUrl', name, { shouldValidate: true })}
            />

            <TextField
              label="Mô tả chức năng chuyên khoa"
              fullWidth
              multiline
              sx={{ mt: 1 }}
              variant="filled"
              rows={3}
              placeholder="Mô tả phạm vi khám và chẩn đoán điều trị..."
              {...register('description')}
            />
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu chuyên khoa'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa chuyên khoa?"
        content={`Bạn có chắc muốn xóa chuyên khoa "${deleteName}"? Lưu ý: Không thể xóa nếu đang có bác sĩ thuộc chuyên khoa này.`}
        confirmText="Xóa chuyên khoa"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
