// src/features/dashboard/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { queryKeys } from '@/api/queryKeys';
import { patientsApi } from '@/api/endpoints/patients.api';
import { appointmentsApi } from '@/api/endpoints/appointments.api';
import { inventoryApi } from '@/api/endpoints/inventory.api';
import { AppointmentStatus } from '@/types';
import type { ChartDateQuery } from '@/types';
import { examinationsApi } from '@/api/endpoints/examinations.api';
import { prescriptionsApi } from '@/api/endpoints/prescriptions.api';
import { invoicesApi } from '@/api/endpoints/invoices.api';
import { triageResultsApi } from '@/api/endpoints/triage-results.api';
import { stockTransactionsApi } from '@/api/endpoints/stock-transactions.api';

export type DashboardChartGroup = 'appointments' | 'clinical' | 'pharmacy' | 'finance';
const dashboardChartQueryOptions = {
  staleTime: 3 * 60_000,
  gcTime: 15 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export function useDashboardCharts(params: ChartDateQuery, activeGroup: DashboardChartGroup) {
  const enabled = Boolean(params.dateFrom && params.dateTo && params.dateFrom <= params.dateTo);
  const { dateFrom, dateTo } = params;
  const dateRange = { dateFrom, dateTo };
  const appointments = useQuery({
    ...dashboardChartQueryOptions,
    queryKey: ['dashboard-charts', 'appointments', params],
    queryFn: () => appointmentsApi.getCharts(params),
    enabled: enabled && activeGroup === 'appointments',
  });
  const examinations = useQuery({
    ...dashboardChartQueryOptions,
    queryKey: ['dashboard-charts', 'examinations', dateFrom, dateTo],
    queryFn: () => examinationsApi.getCharts(dateRange),
    enabled: enabled && activeGroup === 'clinical',
  });
  const prescriptions = useQuery({
    ...dashboardChartQueryOptions,
    queryKey: ['dashboard-charts', 'prescriptions', dateFrom, dateTo],
    queryFn: () => prescriptionsApi.getCharts(dateRange),
    enabled: enabled && activeGroup === 'pharmacy',
  });
  const invoices = useQuery({
    ...dashboardChartQueryOptions,
    queryKey: ['dashboard-charts', 'invoices', dateFrom, dateTo],
    queryFn: () => invoicesApi.getCharts(dateRange),
    enabled: enabled && activeGroup === 'finance',
  });
  const triage = useQuery({
    ...dashboardChartQueryOptions,
    queryKey: ['dashboard-charts', 'triage', dateFrom, dateTo],
    queryFn: () => triageResultsApi.getCharts(dateRange),
    enabled: enabled && activeGroup === 'clinical',
  });
  const stockTransactions = useQuery({
    ...dashboardChartQueryOptions,
    queryKey: ['dashboard-charts', 'stock-transactions', dateFrom, dateTo],
    queryFn: () => stockTransactionsApi.getCharts(dateRange),
    enabled: enabled && activeGroup === 'pharmacy',
  });
  const inventoryCharts = useQuery({
    ...dashboardChartQueryOptions,
    queryKey: ['dashboard-charts', 'inventory'],
    queryFn: () => inventoryApi.getCharts(),
    enabled: activeGroup === 'pharmacy',
  });

  return { appointments, examinations, prescriptions, invoices, triage, stockTransactions, inventoryCharts };
}

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
