// src/features/doctors/schemas/doctor.schema.ts
import { z } from 'zod';
import { DoctorDegree } from '@/types';

export const createDoctorSchema = z.object({
  userId: z.string().min(1, 'Vui lòng chọn tài khoản người dùng liên kết'),
  specialtyId: z.number().optional().nullable(),
  licenseNumber: z.string().min(1, 'Số chứng chỉ hành nghề không được để trống'),
  degree: z.nativeEnum(DoctorDegree, { errorMap: () => ({ message: 'Vui lòng chọn học vị' }) }),
  yearsOfExperience: z.number().min(0, 'Số năm kinh nghiệm không thể âm').max(60, 'Tối đa 60 năm').optional(),
  bio: z.string().optional().or(z.literal('')),
});

export type CreateDoctorFormValues = z.infer<typeof createDoctorSchema>;

export const updateDoctorSchema = z.object({
  specialtyId: z.number().optional().nullable(),
  licenseNumber: z.string().min(1, 'Số chứng chỉ hành nghề không được để trống'),
  degree: z.nativeEnum(DoctorDegree, { errorMap: () => ({ message: 'Vui lòng chọn học vị' }) }),
  yearsOfExperience: z.number().min(0).max(60).optional(),
  bio: z.string().optional().or(z.literal('')),
});

export type UpdateDoctorFormValues = z.infer<typeof updateDoctorSchema>;
