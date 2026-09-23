// src/features/users/pages/UserListPage.tsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import BlockIcon from '@mui/icons-material/Block';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusChip } from '@/components/common/StatusChip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/endpoints/users.api';
import { positionsApi } from '@/api/endpoints/positions.api';
import { queryKeys } from '@/api/queryKeys';
import { notifyApiFeedback } from '@/api/axios';
import { User, UserRole, CreateUserDto, UpdateUserDto, Position } from '@/types';
import dayjs from 'dayjs';

export const UserListPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');

  // Create User Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>(UserRole.USER);
  const [createPositionId, setCreatePositionId] = useState<number | ''>('');

  // Edit User Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>(UserRole.USER);
  const [editPositionId, setEditPositionId] = useState<number | ''>('');
  const [editFullName, setEditFullName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Change Password Dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Deactivate User Dialog
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.list({ page, limit, search: search || undefined, role: roleFilter || undefined }),
    queryFn: () => usersApi.findAll({ page, limit, search: search || undefined, role: roleFilter || undefined }),
    staleTime: 60_000,
  });

  const { data: positionsList } = useQuery({
    queryKey: queryKeys.positions.active(),
    queryFn: () => positionsApi.getActive(),
    staleTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      setCreateDialogOpen(false);
      notifyApiFeedback('Tạo tài khoản người dùng thành công', 'info');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => usersApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      setEditDialogOpen(false);
      setDeactivateUser(null);
      notifyApiFeedback('Cập nhật tài khoản thành công', 'info');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, newPass }: { id: string; newPass: string }) =>
      usersApi.resetPassword(id, newPass),
    onSuccess: () => {
      setPasswordDialogOpen(false);
      setNewPassword('');
      notifyApiFeedback('Đổi mật khẩu người dùng thành công', 'info');
    },
  });

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setEditFullName(u.fullName || '');
    setEditRole(u.role);
    setEditPositionId(u.positionId || '');
    setEditIsActive(u.isActive !== false);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    await updateMutation.mutateAsync({
      id: editingUser.id,
      dto: {
        fullName: editFullName,
        role: editRole,
        positionId: editPositionId !== '' ? Number(editPositionId) : undefined,
        isActive: editIsActive,
      },
    });
  };

  const handleCreate = async () => {
    if (!createEmail || !createPassword || !createFullName) return;
    await createMutation.mutateAsync({
      email: createEmail,
      password: createPassword,
      fullName: createFullName,
      role: createRole,
      positionId: createPositionId !== '' ? Number(createPositionId) : undefined,
      isActive: true,
    });
  };

  const handleToggleActive = async (u: User) => {
    await updateMutation.mutateAsync({
      id: u.id,
      dto: {
        fullName: u.fullName,
        role: u.role,
        positionId: u.positionId,
        isActive: !u.isActive,
      },
    });
  };

  const columns: Column<User>[] = [
    {
      id: 'avatar',
      label: 'Ảnh',
      minWidth: 60,
      render: (row) => (
        <Avatar
          src={row.avatar}
          sx={{ width: 34, height: 34, bgcolor: '#0284c7' }}
          className="text-xs font-semibold"
        >
          {row.fullName?.charAt(0) || row.email.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      id: 'fullName',
      label: 'Họ tên & Email',
      minWidth: 200,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">{row.fullName}</div>
          <div className="text-xs text-slate-400 font-mono">{row.email}</div>
        </div>
      ),
    },
    {
      id: 'role',
      label: 'Vai trò (Role)',
      minWidth: 140,
      render: (row) => <StatusChip status={row.role} type="role" />,
    },
    {
      id: 'position',
      label: 'Chức vụ',
      minWidth: 160,
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.position?.positionTitle || '—'}
        </span>
      ),
    },
    {
      id: 'isActive',
      label: 'Trạng thái',
      minWidth: 110,
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            row.isActive !== false
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {row.isActive !== false ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tham gia',
      minWidth: 120,
      render: (row) => (
        <span className="text-xs tabular-nums text-slate-500">
          {dayjs(row.createdAt).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 140,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Chỉnh sửa tài khoản & vai trò">
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              className="text-slate-500 hover:text-amber-600"
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Đặt lại mật khẩu">
            <IconButton
              size="small"
              onClick={() => {
                setTargetUserId(row.id);
                setPasswordDialogOpen(true);
              }}
              className="text-slate-500 hover:text-sky-600"
            >
              <LockResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={row.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
            <IconButton
              size="small"
              onClick={() => setDeactivateUser(row)}
              className={row.isActive ? 'text-slate-500 hover:text-rose-600' : 'text-slate-500 hover:text-emerald-600'}
            >
              <BlockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản trị Người dùng Hệ thống"
        subtitle="Quản lý tài khoản cán bộ nhân viên, phân vai trò và kiểm soát bảo mật"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Người dùng' }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Tạo tài khoản mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchInput
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            className="sm:w-80"
          />

          <FormControl size="small" className="sm:w-48">
            <InputLabel id="role-filter-label">Vai trò</InputLabel>
            <Select
              labelId="role-filter-label"
              value={roleFilter}
              label="Vai trò"
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | '');
                setPage(1);
              }}
            >
              <MenuItem value="">Tất cả vai trò</MenuItem>
              <MenuItem value={UserRole.SUPER_ADMIN}>Super Admin</MenuItem>
              <MenuItem value={UserRole.ADMIN}>Quản trị viên (Admin)</MenuItem>
              <MenuItem value={UserRole.MANAGER}>Quản lý (Manager)</MenuItem>
              <MenuItem value={UserRole.STAFF}>Nhân viên y tế (Staff)</MenuItem>
              <MenuItem value={UserRole.USER}>Bác sĩ / Người dùng (User)</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> tài khoản
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
        emptyTitle="Chưa có tài khoản nào"
        emptyDescription="Tạo tài khoản mới cho bác sĩ, nhân viên hoặc quản trị viên."
        emptyActionText="Tạo tài khoản đầu tiên"
        onEmptyAction={() => setCreateDialogOpen(true)}
      />

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          Tạo tài khoản người dùng mới
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <TextField
            label="Họ và tên *"
            fullWidth
            size="small"
            value={createFullName}
            onChange={(e) => setCreateFullName(e.target.value)}
            placeholder="BS. Trần Thị B"
          />

          <TextField
            label="Email đăng nhập *"
            type="email"
            fullWidth
            size="small"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            placeholder="bacsi@clinic.vn"
          />

          <TextField
            label="Mật khẩu khởi tạo *"
            type="password"
            fullWidth
            size="small"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
          />

          <div className="grid grid-cols-2 gap-3">
            <FormControl fullWidth size="small">
              <InputLabel id="create-role-label">Phân quyền vai trò *</InputLabel>
              <Select
                labelId="create-role-label"
                value={createRole}
                label="Phân quyền vai trò *"
                onChange={(e) => setCreateRole(e.target.value as UserRole)}
              >
                <MenuItem value={UserRole.USER}>Bác sĩ / Khám chữa (USER)</MenuItem>
                <MenuItem value={UserRole.STAFF}>Nhân viên tiếp đón / Dược (STAFF)</MenuItem>
                <MenuItem value={UserRole.MANAGER}>Trưởng phòng / Quản lý (MANAGER)</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Quản trị viên cơ sở (ADMIN)</MenuItem>
                <MenuItem value={UserRole.SUPER_ADMIN}>Tổng quản trị viên (SUPER_ADMIN)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="create-pos-label">Chức vụ</InputLabel>
              <Select
                labelId="create-pos-label"
                value={createPositionId}
                label="Chức vụ"
                onChange={(e) =>
                  setCreatePositionId(e.target.value === '' ? '' : Number(e.target.value))
                }
              >
                <MenuItem value="">-- Không chọn --</MenuItem>
                {positionsList?.map((p: Position) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.positionTitle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!createEmail || !createPassword || !createFullName || createMutation.isPending}
          >
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          Chỉnh sửa thông tin & Vai trò tài khoản
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <TextField
            label="Họ và tên"
            fullWidth
            size="small"
            value={editFullName}
            onChange={(e) => setEditFullName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormControl fullWidth size="small">
              <InputLabel id="edit-role-label">Vai trò</InputLabel>
              <Select
                labelId="edit-role-label"
                value={editRole}
                label="Vai trò"
                onChange={(e) => setEditRole(e.target.value as UserRole)}
              >
                <MenuItem value={UserRole.USER}>Bác sĩ / Người dùng (USER)</MenuItem>
                <MenuItem value={UserRole.STAFF}>Nhân viên tiếp đón (STAFF)</MenuItem>
                <MenuItem value={UserRole.MANAGER}>Quản lý (MANAGER)</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Quản trị viên (ADMIN)</MenuItem>
                <MenuItem value={UserRole.SUPER_ADMIN}>Tổng quản trị viên (SUPER_ADMIN)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="edit-pos-label">Chức vụ</InputLabel>
              <Select
                labelId="edit-pos-label"
                value={editPositionId}
                label="Chức vụ"
                onChange={(e) =>
                  setEditPositionId(e.target.value === '' ? '' : Number(e.target.value))
                }
              >
                <MenuItem value="">-- Không chọn --</MenuItem>
                {positionsList?.map((p: Position) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.positionTitle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <FormControlLabel
            control={
              <Switch
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                color="primary"
              />
            }
            label="Tài khoản đang hoạt động (Cho phép đăng nhập)"
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          Đặt lại mật khẩu người dùng
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <TextField
            label="Mật khẩu mới *"
            type="password"
            fullWidth
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setPasswordDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={() => {
              if (targetUserId && newPassword.length >= 6) {
                changePasswordMutation.mutate({ id: targetUserId, newPass: newPassword });
              }
            }}
            variant="contained"
            disabled={newPassword.length < 6 || changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toggle Active Confirmation */}
      <ConfirmDialog
        open={Boolean(deactivateUser)}
        title={deactivateUser?.isActive ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
        content={`Bạn có chắc muốn ${deactivateUser?.isActive ? 'khóa' : 'mở khóa'} tài khoản "${deactivateUser?.fullName || deactivateUser?.email}"?`}
        confirmText={deactivateUser?.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
        confirmColor={deactivateUser?.isActive ? 'error' : 'primary'}
        isLoading={updateMutation.isPending}
        onConfirm={() => {
          if (deactivateUser) handleToggleActive(deactivateUser);
        }}
        onClose={() => setDeactivateUser(null)}
      />
    </div>
  );
};
