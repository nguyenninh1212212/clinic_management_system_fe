import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifyApiFeedback } from '@/api/axios';
import { queryKeys } from '@/api/queryKeys';
import { CreateDoctorShiftDto } from '@/types';
import { doctorShiftsApi } from '@/api/endpoints/doctor-shifts.api';

export function useDoctorShifts(doctorId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.doctors.shifts(doctorId, date),
    queryFn: () => doctorShiftsApi.findByDoctorAndDate(doctorId, date),
    enabled: Boolean(doctorId && date),
    staleTime: 30_000,
  });
}

export function useCreateDoctorShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, dto }: { doctorId: string; dto: CreateDoctorShiftDto }) => doctorShiftsApi.create(doctorId, dto),
    onSuccess: (shift, variables) => {
      queryClient.setQueriesData({ queryKey: [...queryKeys.doctors.all, 'shifts', variables.doctorId] }, (cached: any) =>
        Array.isArray(cached) && !cached.some((item: any) => item.id === shift.id) ? [...cached, shift] : cached,
      );
      notifyApiFeedback('Phân công ca làm thành công', 'info');
    },
  });
}

export function useDeleteDoctorShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shiftId: string) => doctorShiftsApi.remove(shiftId),
    onSuccess: (_data, shiftId) => {
      queryClient.setQueriesData({ queryKey: [...queryKeys.doctors.all, 'shifts'] }, (cached: any) =>
        Array.isArray(cached) ? cached.filter((item: any) => item.id !== shiftId) : cached,
      );
      notifyApiFeedback('Đã xóa ca làm của bác sĩ', 'info');
    },
  });
}
