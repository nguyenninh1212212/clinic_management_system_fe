// src/features/patients/schemas/patient.schema.ts
import { z } from 'zod';
import { Gender } from '@/types';

export const patientSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống').max(100, 'Họ tên tối đa 100 ký tự'),
  gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Vui lòng chọn giới tính' }) }),
  dateOfBirth: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  identityNumber: z.string().optional().or(z.literal('')),
  medicalHistory: z.string().optional().or(z.literal('')),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
