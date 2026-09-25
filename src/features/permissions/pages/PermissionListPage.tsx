// src/features/permissions/pages/PermissionListPage.tsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  usePermissionList,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '../hooks/usePermissions';
import { Permission, PermissionAction, CreatePermissionDto } from '@/types';

export const PermissionListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<PermissionAction | ''>('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [permissionCode, setPermissionCode] = useState('');
  const [permissionName, setPermissionName] = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction] = useState<PermissionAction>(PermissionAction.READ);
  const [description, setDescription] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const { data = [], isLoading } = usePermissionList();

  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission();
  const deleteMutation = useDeletePermission();

  const handleOpenCreate = () => {
    setEditingPerm(null);
    setPermissionCode('');
    setPermissionName('');
    setResource('');
    setAction(PermissionAction.READ);
    setDescription('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (perm: Permission) => {
    setEditingPerm(perm);
    setPermissionCode(perm.permissionCode);
    setPermissionName(perm.permissionName);
    setResource(perm.resource);
    setAction(perm.action);
    setDescription(perm.description || '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!permissionCode.trim() || !permissionName.trim() || !resource.trim()) return;

    const payload: CreatePermissionDto = {
      permissionCode: permissionCode.trim(),
      permissionName: permissionName.trim(),
      resource: resource.trim(),
      action,
      description: description.trim() || undefined,
    };

    if (editingPerm) {
      await updateMutation.mutateAsync({
        id: editingPerm.id,
        dto: payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      !search ||
      item.permissionCode.toLowerCase().includes(search.toLowerCase()) ||
      item.permissionName.toLowerCase().includes(search.toLowerCase()) ||
      item.resource.toLowerCase().includes(search.toLowerCase());

    const matchesAction = !actionFilter || item.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const columns: Column<Permission>[] = [
    {
      id: 'id',
      label: 'Mã',
      minWidth: 60,
      render: (row) => <span className="font-mono text-slate-500 text-xs">#{row.id}</span>,
    },
    {
      id: 'permissionCode',
      label: 'Mã quyền (Code)',
      minWidth: 200,
      render: (row) => (
        <div className="flex items-center gap-2">
          <SecurityIcon fontSize="small" className="text-sky-600" />
          <span className="font-mono font-semibold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">
            {row.permissionCode}
          </span>
        </div>
      ),
    },
    {
      id: 'permissionName',
      label: 'Tên quyền hạn',
      minWidth: 180,
      render: (row) => <span className="font-medium text-slate-800 text-sm">{row.permissionName}</span>,
    },
    {
      id: 'resource',
      label: 'Tài nguyên (Resource)',
      minWidth: 140,
      render: (row) => (
        <span className="text-xs font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded">
          {row.resource}
        </span>
      ),
    },
    {
      id: 'action',
      label: 'Hành động',
      minWidth: 120,
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {row.action}
        </span>
      ),
    },
    {
      id: 'description',
      label: 'Mô tả phạm vi',
      minWidth: 220,
      render: (row) => <span className="text-slate-600 text-xs">{row.description || '—'}</span>,
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 100,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Chỉnh sửa quyền">
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              className="text-slate-500 hover:text-amber-600"
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa quyền">
            <IconButton
              size="small"
              onClick={() => {
                setDeleteId(row.id);
                setDeleteName(row.permissionName);
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
        title="Quản trị Phân quyền Hệ thống"
        subtitle="Thiết lập các khóa quyền hạn và danh mục phân quyền truy cập tính năng"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Phân quyền' }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Thêm quyền mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchInput
            placeholder="Tìm theo mã hoặc tên quyền..."
            value={search}
            onChange={(val) => setSearch(val)}
            className="sm:w-80"
          />

          <FormControl size="small" className="sm:w-48">
            <InputLabel id="action-filter-label">Hành động</InputLabel>
            <Select
              labelId="action-filter-label"
              value={actionFilter}
              label="Hành động"
              onChange={(e) => setActionFilter(e.target.value as PermissionAction | '')}
            >
              <MenuItem value="">Tất cả hành động</MenuItem>
              {Object.values(PermissionAction).map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Tổng số: <strong className="text-slate-800">{filteredData.length}</strong> quyền
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredData}
        loading={isLoading}
        emptyTitle="Chưa có quyền nào trong hệ thống"
        emptyDescription="Tạo quyền mới để thiết lập ma trận kiểm soát truy cập chức năng."
        emptyActionText="Thêm quyền đầu tiên"
        onEmptyAction={handleOpenCreate}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          {editingPerm ? 'Cập nhật quyền truy cập' : 'Thêm quyền truy cập mới'}
        </DialogTitle>
        <Divider />
        <DialogContent className="space-y-4 flex flex-col gap-3">
          <TextField
            label="Mã quyền (Permission Code) *"
            fullWidth
            size="small"
            value={permissionCode}
            onChange={(e) => setPermissionCode(e.target.value)}
            placeholder="VD: patients:create, appointments:read..."
          />

          <TextField
            label="Tên quyền hạn hiển thị *"
            fullWidth
            size="small"
            value={permissionName}
            onChange={(e) => setPermissionName(e.target.value)}
            placeholder="VD: Tiếp đón bệnh nhân mới"
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Tài nguyên (Resource) *"
              fullWidth
              size="small"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              placeholder="VD: patients, appointments..."
            />

            <FormControl fullWidth size="small">
              <InputLabel id="action-select-label">Hành động *</InputLabel>
              <Select
                labelId="action-select-label"
                value={action}
                label="Hành động *"
                onChange={(e) => setAction(e.target.value as PermissionAction)}
              >
                {Object.values(PermissionAction).map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <TextField
            label="Mô tả phạm vi quyền hạn"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả các thao tác mà quyền này cho phép thực hiện..."
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !permissionCode.trim() ||
              !permissionName.trim() ||
              !resource.trim() ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu quyền'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa quyền truy cập?"
        content={`Bạn có chắc muốn xóa quyền "${deleteName}"? Thao tác có thể ảnh hưởng đến các vai trò đang gán quyền này.`}
        confirmText="Xóa quyền"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
