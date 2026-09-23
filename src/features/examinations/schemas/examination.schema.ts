// src/features/examinations/schemas/examination.schema.ts
import { z } from 'zod';

export const examinationSchema = z.object({
  appointmentId: z.string().min(1, 'Vui lòng chọn cuộc hẹn khám'),
  doctorId: z.string().min(1, 'Vui lòng chọn bác sĩ khám'),
  diagnosis: z.string().min(1, 'Chẩn đoán xác định không được để trống'),
  icd10Code: z.string().optional().or(z.literal('')),
  clinicalNotes: z.string().optional().or(z.literal('')),
  treatmentPlan: z.string().optional().or(z.literal('')),
  followUpDate: z.string().optional().or(z.literal('')),
});

export type ExaminationFormValues = z.infer<typeof examinationSchema>;
