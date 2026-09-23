// src/features/patients/pages/PatientDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { usePatient, useDeletePatient } from '../hooks/usePatients';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { usePermission } from '@/hooks/usePermission';
import { Appointment } from '@/types';
import dayjs from 'dayjs';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canCreateOrEditPatient, canDeletePatient } = usePermission();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: patient, isLoading, isError } = usePatient(id || '');
  const deleteMutation = useDeletePatient();

  const { data: appointmentsData, isLoading: loadingAppointments } = useAppointments({
    patientId: id,
    page: 1,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="py-12 text-center space-y-4">
        <Typography variant="h6" className="text-slate-800">
          Không tìm thấy hồ sơ bệnh nhân
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/patients')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(patient.id);
      navigate('/patients');
    } catch {
      // Error handled by interceptor
    }
  };

  const appointmentColumns: Column<Appointment>[] = [
    {
      id: 'appointmentDate',
      label: 'Thời gian khám',
      render: (row) => (
        <span className="tabular-nums font-medium text-slate-800">
          {dayjs(row.appointmentDate).format('HH:mm DD/MM/YYYY')}
        </span>
      ),
    },
    {
      id: 'doctor',
      label: 'Bác sĩ phụ trách',
      render: (row) => <span>{row.doctor?.user?.fullName || 'Chưa phân công'}</span>,
    },
    {
      id: 'status',
      label: 'Trạng thái',
      render: (row) => <StatusChip status={row.status} type="appointment" />,
    },
    {
      id: 'notes',
      label: 'Ghi chú / Lý do khám',
      render: (row) => <span className="text-slate-500 text-xs">{row.notes || '—'}</span>,
    },
    {
      id: 'actions',
      label: 'Chi tiết',
      align: 'right',
      render: (row) => (
        <Button
          size="small"
          onClick={() => navigate(`/appointments/${row.id}`)}
          className="text-xs text-sky-700"
        >
          Xem cuộc hẹn
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.fullName}
        subtitle={`Mã hồ sơ: ${patient.id} · Đăng ký lúc ${dayjs(patient.createdAt).format('DD/MM/YYYY')}`}
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Bệnh nhân', href: '/patients' },
          { label: patient.fullName },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/patients')}
              size="small"
            >
              Danh sách
            </Button>
            <Button
              variant="contained"
              startIcon={<EventAvailableIcon />}
              onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
              size="small"
            >
              Tạo lịch hẹn
            </Button>
            {canCreateOrEditPatient && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditOutlinedIcon />}
                onClick={() => navigate(`/patients/${patient.id}/edit`)}
                size="small"
              >
                Chỉnh sửa
              </Button>
            )}
            {canDeletePatient && (
              <IconButton
                color="error"
                onClick={() => setDeleteOpen(true)}
                size="small"
              >
                <DeleteOutlineIcon />
              </IconButton>
            )}
          </div>
        }
      />

      {/* Main Info Card */}
      <Card>
        <CardContent className="p-6">
          <Typography variant="subtitle2" className="text-sky-800 uppercase tracking-wider text-xs font-bold mb-4">
            Thông tin nhân khẩu & hành chính
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-xs text-slate-400">Giới tính</div>
              <div className="text-sm font-semibold text-slate-800 mt-1">
                <StatusChip status={patient.gender} type="gender" />
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Ngày sinh</div>
              <div className="text-sm font-semibold text-slate-800 mt-1 tabular-nums">
                {patient.dateOfBirth
                  ? `${dayjs(patient.dateOfBirth).format('DD/MM/YYYY')} (${dayjs().diff(patient.dateOfBirth, 'year')} tuổi)`
                  : '—'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Số điện thoại liên hệ</div>
              <div className="text-sm font-semibold text-slate-800 mt-1 font-mono tabular-nums">
                {patient.phone || 'Chưa cập nhật'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Số CCCD / CMND</div>
              <div className="text-sm font-semibold text-slate-800 mt-1 font-mono tabular-nums">
                {patient.identityNumber || 'Chưa cập nhật'}
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs text-slate-400">Địa chỉ thường trú</div>
              <div className="text-sm text-slate-700 mt-1">
                {patient.address || 'Chưa cập nhật'}
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs text-slate-400">Tiền sử bệnh lý & Dị ứng thuốc</div>
              <div className="text-sm text-rose-700 font-medium mt-1 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                {patient.medicalHistory || 'Không ghi nhận tiền sử đặc biệt'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="text-slate-800 font-bold text-base">
            Lịch sử khám bệnh & Lịch hẹn
          </Typography>
          <span className="text-xs text-slate-500 tabular-nums">
            Tổng cộng: {appointmentsData?.pagination?.total || (appointmentsData?.data?.length || 0)} lượt
          </span>
        </div>

        <DataTable
          columns={appointmentColumns}
          rows={appointmentsData?.data || []}
          loading={loadingAppointments}
          emptyTitle="Chưa có lịch hẹn khám nào"
          emptyDescription="Bệnh nhân này chưa có lịch hẹn khám hoặc tiền sử điều trị."
          emptyActionText="Đặt lịch khám ngay"
          onEmptyAction={() => navigate(`/appointments/new?patientId=${patient.id}`)}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Xóa hồ sơ bệnh nhân?"
        content={`Bạn có chắc muốn xóa vĩnh viễn hồ sơ của bệnh nhân "${patient.fullName}"?`}
        confirmText="Xóa hồ sơ"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};
