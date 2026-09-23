// src/features/appointments/pages/AppointmentListPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AppointmentStatusDialog } from '../components/AppointmentStatusDialog';
import { useAppointments, useDeleteAppointment } from '../hooks/useAppointments';
import { useDoctors } from '@/features/doctors/hooks/useDoctors';
import { Appointment, AppointmentStatus } from '@/types';
import dayjs from 'dayjs';

export const AppointmentListPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<AppointmentStatus | ''>('');
  const [doctorId, setDoctorId] = useState<string>('');
  const [date, setDate] = useState<string>('');

  // Status Dialog State
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Delete State (Pending only)
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: doctorsData } = useDoctors({ limit: 50 });
  const { data, isLoading } = useAppointments({
    page,
    limit,
    status: status || undefined,
    doctorId: doctorId || undefined,
    date: date || undefined,
  });

  const deleteMutation = useDeleteAppointment();

  const handleOpenStatus = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setStatusDialogOpen(true);
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

  const columns: Column<Appointment>[] = [
    {
      id: 'stt',
      label: 'STT',
      minWidth: 50,
      render: (_row, idx) => (
        <span className="text-slate-400 tabular-nums">
          {(page - 1) * limit + idx + 1}
        </span>
      ),
    },
    {
      id: 'patient',
      label: 'Bệnh nhân',
      minWidth: 180,
      render: (row) => (
        <div>
          <button
            onClick={() => navigate(`/appointments/${row.id}`)}
            className="font-semibold text-sky-700 hover:underline text-left text-sm"
          >
            {row.patient?.fullName || 'Bệnh nhân'}
          </button>
          <div className="text-xs text-slate-400 font-mono">{row.patient?.phone}</div>
        </div>
      ),
    },
    {
      id: 'doctor',
      label: 'Bác sĩ phụ trách',
      minWidth: 160,
      render: (row) => (
        <span className="text-slate-700">
          {row.doctor?.user?.fullName || (row.doctorId ? 'Bác sĩ chuyên khoa' : 'Chưa phân công')}
        </span>
      ),
    },
    {
      id: 'appointmentDate',
      label: 'Ngày hẹn khám',
      minWidth: 150,
      render: (row) => (
        <div className="tabular-nums">
          <div className="font-semibold text-slate-800 text-xs">
            {dayjs(row.appointmentDate).format('HH:mm')}
          </div>
          <div className="text-[11px] text-slate-500">
            {dayjs(row.appointmentDate).format('DD/MM/YYYY')}
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 150,
      render: (row) => (
        <button
          onClick={() => handleOpenStatus(row)}
          className="cursor-pointer hover:opacity-85 text-left group flex items-center gap-1"
          title="Bấm để đổi trạng thái"
        >
          <StatusChip status={row.status} type="appointment" />
          <AutorenewIcon fontSize="inherit" className="text-slate-400 group-hover:text-sky-600 text-xs" />
        </button>
      ),
    },
    {
      id: 'notes',
      label: 'Ghi chú',
      minWidth: 160,
      render: (row) => (
        <span className="text-slate-500 text-xs line-clamp-1">{row.notes || '—'}</span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 140,
      render: (row) => {
        const canEdit = ![AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(row.status);
        const canDelete = row.status === AppointmentStatus.PENDING;

        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip title="Xem chi tiết cuộc hẹn">
              <IconButton
                size="small"
                onClick={() => navigate(`/appointments/${row.id}`)}
                className="text-slate-500 hover:text-sky-600"
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {canEdit && (
              <Tooltip title="Chỉnh sửa lịch hẹn">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/appointments/${row.id}/edit`)}
                  className="text-slate-500 hover:text-amber-600"
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {canDelete && (
              <Tooltip title="Xóa lịch hẹn (chỉ khi đang Chờ)">
                <IconButton
                  size="small"
                  onClick={() => setDeleteId(row.id)}
                  className="text-slate-500 hover:text-rose-600"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lịch hẹn Khám bệnh"
        subtitle="Tiếp nhận bệnh nhân, phân loại sinh hiệu và điều phối phòng khám"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Lịch hẹn' }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/new')}
          >
            Đặt lịch khám
          </Button>
        }
      />

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <TextField
          label="Lọc theo ngày khám"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
        />

        <FormControl size="small">
          <InputLabel id="appt-status-filter">Trạng thái cuộc hẹn</InputLabel>
          <Select
            labelId="appt-status-filter"
            value={status}
            label="Trạng thái cuộc hẹn"
            onChange={(e) => {
              setStatus(e.target.value as AppointmentStatus | '');
              setPage(1);
            }}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            <MenuItem value={AppointmentStatus.PENDING}>Chờ xác nhận</MenuItem>
            <MenuItem value={AppointmentStatus.CONFIRMED}>Đã xác nhận</MenuItem>
            <MenuItem value={AppointmentStatus.WAITING_TRIAGE}>Chờ phân loại</MenuItem>
            <MenuItem value={AppointmentStatus.TRIAGED}>Đã phân loại sinh hiệu</MenuItem>
            <MenuItem value={AppointmentStatus.IN_EXAMINATION}>Đang khám</MenuItem>
            <MenuItem value={AppointmentStatus.COMPLETED}>Hoàn thành</MenuItem>
            <MenuItem value={AppointmentStatus.CANCELLED}>Đã hủy</MenuItem>
            <MenuItem value={AppointmentStatus.NO_SHOW}>Vắng mặt</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="appt-doctor-filter">Bác sĩ phụ trách</InputLabel>
          <Select
            labelId="appt-doctor-filter"
            value={doctorId}
            label="Bác sĩ phụ trách"
            onChange={(e) => {
              setDoctorId(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Tất cả bác sĩ</MenuItem>
            {doctorsData?.data?.map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.user?.fullName} ({doc.specialty?.name || 'Đa khoa'})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="flex items-center justify-end">
          {(date || status || doctorId) && (
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setDate('');
                setStatus('');
                setDoctorId('');
                setPage(1);
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
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
        emptyTitle="Chưa có lịch hẹn nào"
        emptyDescription="Thử thay đổi bộ lọc ngày/trạng thái hoặc đặt lịch khám mới."
        emptyActionText="Đặt lịch hẹn khám mới"
        onEmptyAction={() => navigate('/appointments/new')}
      />

      {/* Status Transition Dialog */}
      <AppointmentStatusDialog
        open={statusDialogOpen}
        appointment={selectedAppointment}
        onClose={() => {
          setStatusDialogOpen(false);
          setSelectedAppointment(null);
        }}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Xóa lịch hẹn?"
        content="Bạn có chắc muốn xóa lịch hẹn đang chờ xử lý này?"
        confirmText="Xóa lịch hẹn"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
