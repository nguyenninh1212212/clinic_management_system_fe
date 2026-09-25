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
    onSuccess: (_shift, variables) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.doctors.all, 'shifts', variables.doctorId] });
      notifyApiFeedback('Phân công ca làm thành công', 'info');
    },
  });
}

export function useDeleteDoctorShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shiftId: string) => doctorShiftsApi.remove(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
      notifyApiFeedback('Đã xóa ca làm của bác sĩ', 'info');
    },
  });
}