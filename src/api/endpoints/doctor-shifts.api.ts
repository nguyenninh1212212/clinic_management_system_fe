import { api } from '@/api/axios';
import { CreateDoctorShiftDto, DoctorShift } from '@/types';

const unwrap = (response: any): DoctorShift[] => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const doctorShiftsApi = {
  findByDoctorAndDate: async (doctorId: string, date: string): Promise<DoctorShift[]> =>
    unwrap(await api.get(`/doctors/${doctorId}/shifts`, { params: { date } })),

  create: (doctorId: string, dto: CreateDoctorShiftDto): Promise<DoctorShift> =>
    api.post(`/doctors/${doctorId}/shifts`, dto).then((response) => response.data?.data || response.data),

  remove: (shiftId: string): Promise<void> =>
    api.delete(`/doctors/shifts/${shiftId}`).then((response) => response.data),
};