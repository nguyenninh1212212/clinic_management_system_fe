import { z } from 'zod';
import { RelationshipType } from '@/types';
import { patientSchema } from '@/features/patients/schemas/patient.schema';

export const grantAccessSchema = z.object({
  patient: patientSchema,
  access: z.object({
    relationship: z.nativeEnum(RelationshipType, { errorMap: () => ({ message: 'Vui lòng chọn mối quan hệ' }) }),
    isLegalGuardian: z.boolean().default(false),
    note: z.string().optional().or(z.literal('')),
  })
});

export type GrantAccessFormValues = z.infer<typeof grantAccessSchema>;

export const updateAccessSchema = z.object({
  relationship: z.nativeEnum(RelationshipType, { errorMap: () => ({ message: 'Vui lòng chọn mối quan hệ' }) }),
  isLegalGuardian: z.boolean().default(false),
  note: z.string().optional().or(z.literal('')),
});

export type UpdateAccessFormValues = z.infer<typeof updateAccessSchema>;
