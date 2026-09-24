// src/features/medicines/pages/MedicineListPage.tsx
import React, { useRef, useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { notifyApiFeedback } from '@/api/axios';
import { medicinesApi } from '@/api/endpoints/medicines.api';
import { queryKeys } from '@/api/queryKeys';
import {
  useMedicines,
  useCreateMedicine,
  useUpdateMedicine,
  useDeleteMedicine,
} from '../hooks/useMedicines';
import { Medicine, MedicineCategory, CreateMedicineDto } from '@/types';
import * as XLSX from 'xlsx';
export const MedicineListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MedicineCategory | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [unit, setUnit] = useState('Viên');
  const [medCategory, setMedCategory] = useState<MedicineCategory>(MedicineCategory.ANTIBIOTIC);
  const [description, setDescription] = useState('');
  const [minStockLevel, setMinStockLevel] = useState(100);
  const [manufacturer, setManufacturer] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const { data, isLoading } = useMedicines({
    page,
    limit,
    search: search || undefined,
    category: category || undefined,
  });

  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine();
  const deleteMutation = useDeleteMedicine();

  const handleOpenCreate = () => {
    setEditingMedicine(null);
    setName('');
    setGenericName('');
    setUnit('Viên');
    setMedCategory(MedicineCategory.ANTIBIOTIC);
    setDescription('');
    setMinStockLevel(100);
    setManufacturer('');
    setRegistrationNumber('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (m: Medicine) => {
    setEditingMedicine(m);
    setName(m.name);
    setGenericName(m.genericName || '');
    setUnit(m.unit);
    setMedCategory(m.category);
    setDescription(m.description || '');
    setMinStockLevel(m.minStockLevel || 100);
    setManufacturer(m.manufacturer || '');
    setRegistrationNumber(m.registrationNumber || '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !unit.trim()) return;

    const payload: CreateMedicineDto = {
      name: name.trim(),
      genericName: genericName.trim() || undefined,
      unit: unit.trim(),
      category: medCategory,
      description: description.trim() || undefined,
      minStockLevel: Number(minStockLevel) || 0,
      manufacturer: manufacturer.trim() || undefined,
      registrationNumber: registrationNumber.trim() || undefined,
    };

    try {
      if (editingMedicine) {
        await updateMutation.mutateAsync({ id: editingMedicine.id, dto: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setDialogOpen(false);
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
const handleDownloadTemplate = () => {
  const rows = [
    [
      'name',
      'genericName',
      'unit',
      'category',
      'description',
      'minStockLevel',
      'manufacturer',
      'registrationNumber',
    ],
    [
      'Paracetamol 500mg',
      'Paracetamol',
      'Viên',
      'ANTIBIOTIC',
      'Bảo quản nơi khô ráo',
      100,
      'DHG Pharma',
      'VD-12345',
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines');

  XLSX.writeFile(workbook, 'medicine_import_template.xlsx');
};

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await medicinesApi.importFromExcel(file);
      queryClient.invalidateQueries({ queryKey: queryKeys.medicines.all });
      notifyApiFeedback('Import thuốc từ Excel thành công', 'info');
      setPage(1);
    } catch {
      // Handled by interceptor
    } finally {
      event.target.value = '';
    }
  };

  const columns: Column<Medicine>[] = [
    {
      id: 'name',
      label: 'Tên biệt dược / Hoạt chất',
      minWidth: 220,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            {row.name}
            {row.isLowStock && (
              <Tooltip title="Cảnh báo tồn kho dưới mức an toàn">
                <WarningAmberIcon fontSize="small" className="text-amber-500" />
              </Tooltip>
            )}
          </div>
          {row.genericName && (
            <div className="text-xs text-slate-500 font-mono italic">
              Hoạt chất: {row.genericName}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'category',
      label: 'Nhóm thuốc',
      minWidth: 150,
      render: (row) => (
        <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {row.category}
        </span>
      ),
    },
    {
      id: 'unit',
      label: 'Đơn vị tính',
      minWidth: 100,
      render: (row) => <span className="text-xs text-slate-700">{row.unit}</span>,
    },
    {
      id: 'stock',
      label: 'Tổng tồn kho',
      minWidth: 130,
      render: (row) => (
        <div>
          <span
            className={`text-sm font-bold tabular-nums ${
              (row.totalStock || 0) <= (row.minStockLevel || 0)
                ? 'text-rose-600'
                : 'text-emerald-700'
            }`}
          >
            {row.totalStock ?? 0} {row.unit}
          </span>
          <div className="text-[11px] text-slate-400 tabular-nums">
            Mức sàn: {row.minStockLevel || 0}
          </div>
        </div>
      ),
    },
    {
      id: 'manufacturer',
      label: 'Hãng sản xuất / SĐK',
      minWidth: 180,
      render: (row) => (
        <div className="text-xs">
          <div className="text-slate-800">{row.manufacturer || '—'}</div>
          {row.registrationNumber && (
            <div className="text-slate-400 font-mono">SĐK: {row.registrationNumber}</div>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 110,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Chỉnh sửa thông tin thuốc">
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              className="text-slate-500 hover:text-amber-600"
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Xóa thuốc">
            <IconButton
              size="small"
              onClick={() => {
                setDeleteId(row.id);
                setDeleteName(row.name);
              }}
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
        title="Danh mục Thuốc & Dược phẩm"
        subtitle="Quản lý danh bạ biệt dược, hoạt chất, mức dự trữ an toàn và đơn vị tính"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Danh mục Thuốc' }]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={handleDownloadTemplate}>
              Mẫu Excel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<UploadFileOutlinedIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import Excel
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              Thêm thuốc mới
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportExcel}
            />
          </div>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchInput
            placeholder="Tìm theo tên biệt dược hoặc hoạt chất..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            className="sm:w-80"
          />

          <FormControl size="small" className="sm:w-56">
            <InputLabel id="category-filter-label">Nhóm tác dụng dược lý</InputLabel>
            <Select
              labelId="category-filter-label"
              value={category}
              label="Nhóm tác dụng dược lý"
              onChange={(e) => {
                setCategory(e.target.value as MedicineCategory | '');
                setPage(1);
              }}
            >
              <MenuItem value="">Tất cả nhóm thuốc</MenuItem>
              {Object.values(MedicineCategory).map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Tổng cộng: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> loại thuốc
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
        emptyTitle="Chưa có thuốc nào trong danh mục"
        emptyDescription="Thêm danh mục thuốc để phục vụ kê đơn và quản lý kho dược."
        emptyActionText="Thêm thuốc đầu tiên"
        onEmptyAction={handleOpenCreate}
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          {editingMedicine ? 'Chỉnh sửa thông tin thuốc' : 'Thêm mới thuốc vào danh mục'}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Tên biệt dược *"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Paracetamol 500mg, Augmentin 1g..."
            />

            <TextField
              label="Hoạt chất / Tên chung quốc tế"
              fullWidth
              size="small"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              placeholder="VD: Amoxicillin + Clavulanic acid"
            />

            <FormControl fullWidth size="small">
              <InputLabel id="dialog-cat-label">Nhóm thuốc *</InputLabel>
              <Select
                labelId="dialog-cat-label"
                value={medCategory}
                label="Nhóm thuốc *"
                onChange={(e) => setMedCategory(e.target.value as MedicineCategory)}
              >
                {Object.values(MedicineCategory).map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Đơn vị tính *"
              fullWidth
              size="small"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Viên, Vỉ, Hộp, Chai, Ống..."
            />

            <TextField
              label="Mức tồn kho an toàn tối thiểu"
              type="number"
              fullWidth
              size="small"
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(Number(e.target.value))}
            />

            <TextField
              label="Số đăng ký lưu hành (SĐK)"
              fullWidth
              size="small"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="VD: VD-21543-14"
            />

            <div className="sm:col-span-2">
              <TextField
                label="Hãng sản xuất / Quốc gia"
                fullWidth
                size="small"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="VD: Dược Hậu Giang (DHG Pharma) - Việt Nam"
              />
            </div>

            <div className="sm:col-span-2">
              <TextField
                label="Mô tả / Hướng dẫn bảo quản"
                fullWidth
                multiline
                rows={3}
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bảo quản nơi khô ráo dưới 30°C, tránh ánh sáng trực tiếp..."
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim() || !unit.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa thuốc khỏi danh mục?"
        content={`Bạn có chắc muốn xóa "${deleteName}"? Thao tác có thể ảnh hưởng đến các đơn thuốc đã kê.`}
        confirmText="Xóa thuốc"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
