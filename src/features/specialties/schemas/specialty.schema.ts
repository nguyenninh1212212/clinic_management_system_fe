// src/features/specialties/schemas/specialty.schema.ts
import { z } from 'zod';

export const specialtySchema = z.object({
  name: z.string().min(1, 'Tên chuyên khoa không được để trống').max(100),
  description: z.string().optional().or(z.literal('')),
  iconUrl: z.string().optional().or(z.literal('')),
});

export type SpecialtyFormValues = z.infer<typeof specialtySchema>;
