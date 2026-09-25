// src/features/appointments/schemas/appointment.schema.ts
import { z } from 'zod';
import { AppointmentStatus } from '@/types';

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Vui lòng chọn bệnh nhân'),
  doctorId: z.string().min(1, 'Vui lòng chọn bác sĩ có ca làm được phân công'),
  appointmentDate: z.string().min(1, 'Vui lòng chọn thời gian khám'),
  notes: z.string().optional().or(z.literal('')),
});

export type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  notes: z.string().optional(),
});

export type UpdateAppointmentStatusFormValues = z.infer<typeof updateAppointmentStatusSchema>;
