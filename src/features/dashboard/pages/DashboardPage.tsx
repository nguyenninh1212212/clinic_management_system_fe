// src/features/dashboard/pages/DashboardPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Skeleton,
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { patientsApi } from '@/api/endpoints/patients.api';
import { appointmentsApi } from '@/api/endpoints/appointments.api';
import { medicinesApi } from '@/api/endpoints/medicines.api';
import { inventoryApi } from '@/api/endpoints/inventory.api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { Appointment, AppointmentStatus } from '@/types';
import { usePermission } from '@/hooks/usePermission';
import dayjs from 'dayjs';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { canCreateOrEditPatient } = usePermission();
  const todayStr = dayjs().format('YYYY-MM-DD');

  // Stats queries
  const { data: patientsData, isLoading: loadingPatients } = useQuery({
    queryKey: queryKeys.patients.list({ page: 1, limit: 1 }),
    queryFn: () => patientsApi.findAll({ page: 1, limit: 1 }),
    staleTime: 60_000,
  });

  const { data: todayAppointments, isLoading: loadingTodayAppts } = useQuery({
    queryKey: queryKeys.appointments.list({ date: todayStr, page: 1, limit: 10 }),
    queryFn: () => appointmentsApi.findAll({ date: todayStr, page: 1, limit: 10 }),
    staleTime: 30_000,
  });

  const { data: pendingAppointments, isLoading: loadingPending } = useQuery({
    queryKey: queryKeys.appointments.list({ status: AppointmentStatus.PENDING, page: 1, limit: 1 }),
    queryFn: () => appointmentsApi.findAll({ status: AppointmentStatus.PENDING, page: 1, limit: 1 }),
    staleTime: 30_000,
  });

  const { data: lowStockData, isLoading: loadingLowStock } = useQuery({
    queryKey: queryKeys.inventory.list({ lowStock: true, page: 1, limit: 1 }),
    queryFn: () => inventoryApi.findAll({ lowStock: true, page: 1, limit: 1 }),
    staleTime: 5 * 60_000,
  });

  // Recent appointments
  const { data: recentAppointments, isLoading: loadingRecent } = useQuery({
    queryKey: queryKeys.appointments.list({ page: 1, limit: 10 }),
    queryFn: () => appointmentsApi.findAll({ page: 1, limit: 10 }),
    staleTime: 30_000,
  });

  const totalPatients = patientsData?.pagination?.total ?? 0;
  const totalToday = todayAppointments?.pagination?.total ?? (todayAppointments?.data?.length || 0);
  const totalPending = pendingAppointments?.pagination?.total ?? (pendingAppointments?.data?.length || 0);
  const totalLowStock = lowStockData?.pagination?.total ?? (lowStockData?.data?.length || 0);

  const columns: Column<Appointment>[] = [
    {
      id: 'patient',
      label: 'Bệnh nhân',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.patient?.fullName || '—'}</div>
          <div className="text-xs text-slate-400 tabular-nums">{row.patient?.phone || ''}</div>
        </div>
      ),
    },
    {
      id: 'doctor',
      label: 'Bác sĩ phụ trách',
      render: (row) => (
        <span className="text-slate-700">
          {row.doctor?.user?.fullName || (row.doctorId ? 'Bác sĩ chuyên khoa' : 'Chưa chỉ định')}
        </span>
      ),
    },
    {
      id: 'appointmentDate',
      label: 'Thời gian hẹn',
      render: (row) => (
        <span className="tabular-nums text-slate-600 font-medium">
          {row.appointmentDate ? dayjs(row.appointmentDate).format('HH:mm DD/MM/YYYY') : '—'}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      render: (row) => <StatusChip status={row.status} type="appointment" />,
    },
    {
      id: 'notes',
      label: 'Ghi chú',
      render: (row) => (
        <span className="text-xs text-slate-500 line-clamp-1 max-w-xs">{row.notes || '—'}</span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      render: (row) => (
        <Button
          size="small"
          variant="text"
          onClick={() => navigate(`/appointments/${row.id}`)}
          className="text-xs font-semibold text-sky-700"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan phòng khám"
        subtitle={`Hôm nay: ${dayjs().format('dddd, [ngày] DD/MM/YYYY')} · Báo cáo tiếp nhận & hoạt động lâm sàng`}
        action={
          <div className="flex items-center gap-2">
            {canCreateOrEditPatient && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/patients/new')}
                size="small"
              >
                Tiếp nhận bệnh nhân
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<CalendarMonthIcon />}
              onClick={() => navigate('/appointments/new')}
              size="small"
            >
              Đặt lịch hẹn
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <Card className="hover:border-sky-300 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <Typography variant="caption" className="text-slate-500 font-medium tracking-wide">
                TỔNG SỐ BỆNH NHÂN
              </Typography>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {loadingPatients ? <Skeleton width={60} /> : totalPatients.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-400 mt-1">Đã lưu trong hệ thống</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <PeopleOutlineIcon fontSize="medium" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Today Appointments */}
        <Card className="hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <Typography variant="caption" className="text-slate-500 font-medium tracking-wide">
                LỊCH HẸN HÔM NAY
              </Typography>
              <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                {loadingTodayAppts ? <Skeleton width={60} /> : totalToday.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Lịch đăng ký ngày {dayjs().format('DD/MM')}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <EventAvailableOutlinedIcon fontSize="medium" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pending Appointments */}
        <Card className="hover:border-amber-300 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <Typography variant="caption" className="text-slate-500 font-medium tracking-wide">
                CHỜ TIẾP NHẬN / PHÂN LOẠI
              </Typography>
              <div className="text-2xl font-bold text-amber-700 mt-1 tabular-nums">
                {loadingPending ? <Skeleton width={60} /> : totalPending.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-400 mt-1">Cần điều dưỡng tiếp đón</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <HourglassEmptyOutlinedIcon fontSize="medium" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Low Stock Alert */}
        <Card className="hover:border-rose-300 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <Typography variant="caption" className="text-slate-500 font-medium tracking-wide">
                DƯỢC SẮP HẾT / CẢNH BÁO
              </Typography>
              <div className="text-2xl font-bold text-rose-700 mt-1 tabular-nums">
                {loadingLowStock ? <Skeleton width={60} /> : totalLowStock.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-400 mt-1">Lô dược dưới mức tối thiểu</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <WarningAmberOutlinedIcon fontSize="medium" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="h6" className="text-slate-800 font-bold text-base">
              Lịch khám gần đây
            </Typography>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              10 bản ghi mới nhất
            </span>
          </div>
          <Button
            size="small"
            variant="text"
            onClick={() => navigate('/appointments')}
            className="text-xs text-sky-700 font-semibold"
          >
            Xem tất cả lịch hẹn →
          </Button>
        </div>

        <DataTable
          columns={columns}
          rows={recentAppointments?.data || []}
          loading={loadingRecent}
          emptyTitle="Chưa có lịch hẹn nào"
          emptyDescription="Tạo cuộc hẹn mới cho bệnh nhân hoặc kiểm tra bộ lọc."
          emptyActionText="Tạo lịch hẹn đầu tiên"
          onEmptyAction={() => navigate('/appointments/new')}
        />
      </div>
    </div>
  );
};
