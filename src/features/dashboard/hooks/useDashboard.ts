// src/features/dashboard/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { queryKeys } from '@/api/queryKeys';
import { patientsApi } from '@/api/endpoints/patients.api';
import { appointmentsApi } from '@/api/endpoints/appointments.api';
import { inventoryApi } from '@/api/endpoints/inventory.api';
import { AppointmentStatus } from '@/types';

export function useDashboardStats() {
  const todayStr = dayjs().format('YYYY-MM-DD');

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

  return {
    totalPatients: patientsData?.pagination?.total ?? 0,
    totalToday: todayAppointments?.pagination?.total ?? (todayAppointments?.data?.length || 0),
    totalPending: pendingAppointments?.pagination?.total ?? (pendingAppointments?.data?.length || 0),
    totalLowStock: lowStockData?.pagination?.total ?? (lowStockData?.data?.length || 0),
    loadingPatients,
    loadingTodayAppts,
    loadingPending,
    loadingLowStock,
  };
}

export function useDashboardRecentAppointments() {
  const { data: recentAppointments, isLoading: loadingRecent } = useQuery({
    queryKey: queryKeys.appointments.list({ page: 1, limit: 10 }),
    queryFn: () => appointmentsApi.findAll({ page: 1, limit: 10 }),
    staleTime: 30_000,
  });

  return {
    recentAppointments,
    loadingRecent,
  };
}
