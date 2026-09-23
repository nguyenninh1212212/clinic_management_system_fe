// src/features/medicines/schemas/medicine.schema.ts
import { z } from 'zod';

export const medicineSchema = z.object({
  name: z.string().min(1, 'Tên thuốc không được để trống').max(150),
  activeIngredient: z.string().optional().or(z.literal('')),
  strength: z.string().optional().or(z.literal('')),
  unit: z.string().min(1, 'Đơn vị tính không được để trống (viên, lọ, vỉ, ống...)'),
  dosageForm: z.string().optional().or(z.literal('')),
  route: z.string().optional().or(z.literal('')),
  manufacturer: z.string().optional().or(z.literal('')),
  originCountry: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

export type MedicineFormValues = z.infer<typeof medicineSchema>;
