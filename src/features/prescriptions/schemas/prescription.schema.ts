// src/features/prescriptions/schemas/prescription.schema.ts
import { z } from 'zod';

export const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1, 'Vui lòng chọn thuốc'),
  quantity: z.number().min(1, 'Số lượng tối thiểu là 1'),
  dosage: z.string().min(1, 'Vui lòng nhập liều lượng (VD: 1 viên/lần)'),
  frequency: z.string().min(1, 'Vui lòng nhập tần suất (VD: 2 lần/ngày)'),
  durationDays: z.number().min(1).optional(),
  instructions: z.string().optional().or(z.literal('')),
});

export const prescriptionSchema = z.object({
  examinationId: z.string().min(1, 'Vui lòng chọn phiếu khám bệnh'),
  notes: z.string().optional().or(z.literal('')),
  items: z.array(prescriptionItemSchema).min(1, 'Đơn thuốc phải có ít nhất 1 loại thuốc'),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;
export type PrescriptionItemFormValues = z.infer<typeof prescriptionItemSchema>;
