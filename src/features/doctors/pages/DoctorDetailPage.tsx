// src/features/doctors/pages/DoctorDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDoctor, useDeleteDoctor } from '../hooks/useDoctors';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { usePermission } from '@/hooks/usePermission';
import { Appointment, DoctorDegree } from '@/types';
import dayjs from 'dayjs';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageDoctors, canDeleteDoctor } = usePermission();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: doctor, isLoading, isError } = useDoctor(id || '');
  const deleteMutation = useDeleteDoctor();

  const { data: appointmentsData, isLoading: loadingAppointments } = useAppointments({
    doctorId: id,
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

  if (isError || !doctor) {
    return (
      <div className="py-12 text-center space-y-4">
        <Typography variant="h6" className="text-slate-800">
          Không tìm thấy hồ sơ bác sĩ
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/doctors')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(doctor.id);
      navigate('/doctors');
    } catch {
      // Handled by interceptor
    }
  };

  const getDegreeLabel = (d?: DoctorDegree) => {
    switch (d) {
      case DoctorDegree.MD:
        return 'Bác sĩ Đa khoa (MD)';
      case DoctorDegree.MASTER:
        return 'Thạc sĩ Y khoa';
      case DoctorDegree.PHD:
        return 'Tiến sĩ Y khoa';
      case DoctorDegree.PROFESSOR:
        return 'Giáo sư';
      case DoctorDegree.ASSOCIATE_PROFESSOR:
        return 'Phó Giáo sư';
      default:
        return d || '—';
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
      id: 'patient',
      label: 'Bệnh nhân',
      render: (row) => <span>{row.patient?.fullName || '—'}</span>,
    },
    {
      id: 'status',
      label: 'Trạng thái',
      render: (row) => <StatusChip status={row.status} type="appointment" />,
    },
    {
      id: 'notes',
      label: 'Ghi chú',
      render: (row) => <span className="text-slate-500 text-xs">{row.notes || '—'}</span>,
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      render: (row) => (
        <Button
          size="small"
          onClick={() => navigate(`/appointments/${row.id}`)}
          className="text-xs text-sky-700"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={doctor.user?.fullName || 'Hồ sơ Bác sĩ'}
        subtitle={`Số CCHN: ${doctor.licenseNumber} · Chuyên khoa: ${doctor.specialty?.name || 'Đa khoa'}`}
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Bác sĩ', href: '/doctors' },
          { label: doctor.user?.fullName || 'Chi tiết' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/doctors')}
              size="small"
            >
              Danh sách
            </Button>
            <Button
              variant="contained"
              startIcon={<EventAvailableIcon />}
              onClick={() => navigate(`/appointments/new?doctorId=${doctor.id}`)}
              size="small"
            >
              Đặt lịch với BS
            </Button>
            {canManageDoctors && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditOutlinedIcon />}
                onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                size="small"
              >
                Chỉnh sửa
              </Button>
            )}
            {canDeleteDoctor && (
              <IconButton color="error" onClick={() => setDeleteOpen(true)} size="small">
                <DeleteOutlineIcon />
              </IconButton>
            )}
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar
              src={doctor.user?.avatar}
              sx={{ width: 80, height: 80, bgcolor: '#0284c7' }}
              className="text-2xl font-bold shadow-md"
            >
              {doctor.user?.fullName?.charAt(0) || 'D'}
            </Avatar>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-400">Học vị / Học hàm</div>
                <div className="text-sm font-semibold text-slate-800 mt-1">
                  {getDegreeLabel(doctor.degree)}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Chuyên khoa</div>
                <div className="text-sm font-semibold text-sky-700 mt-1">
                  {doctor.specialty?.name || 'Chưa phân chuyên khoa'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Số CCHN</div>
                <div className="text-sm font-semibold font-mono text-slate-800 mt-1">
                  {doctor.licenseNumber}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Kinh nghiệm công tác</div>
                <div className="text-sm font-semibold text-slate-800 mt-1 tabular-nums">
                  {doctor.yearsOfExperience ? `${doctor.yearsOfExperience} năm` : 'Chưa cập nhật'}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-xs text-slate-400">Email tài khoản</div>
                <div className="text-sm text-slate-700 mt-1 font-mono">
                  {doctor.user?.email || '—'}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-xs text-slate-400">Tiểu sử & Giới thiệu chuyên môn</div>
                <div className="text-sm text-slate-600 mt-1">
                  {doctor.bio || 'Chưa có thông tin tiểu sử'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor's appointments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="text-slate-800 font-bold text-base">
            Danh sách lịch hẹn phụ trách
          </Typography>
          <span className="text-xs text-slate-500 tabular-nums">
            Tổng cộng: {appointmentsData?.pagination?.total || (appointmentsData?.data?.length || 0)} lịch
          </span>
        </div>

        <DataTable
          columns={appointmentColumns}
          rows={appointmentsData?.data || []}
          loading={loadingAppointments}
          emptyTitle="Chưa có lịch khám nào"
          emptyDescription="Bác sĩ này hiện chưa được xếp lịch khám bệnh nào."
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Xóa hồ sơ bác sĩ?"
        content={`Bạn có chắc muốn xóa vĩnh viễn hồ sơ của bác sĩ "${doctor.user?.fullName}"?`}
        confirmText="Xóa hồ sơ"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};
