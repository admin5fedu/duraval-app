import { z } from 'zod';
import { requiredStringSchema } from '@lib/schemas/common/required.schema';

/**
 * NhomCauHoi form schema
 * Validates all fields for question group form
 */
export const nhomCauHoiFormSchema = z.object({
  ten_nhom: requiredStringSchema('Tên nhóm'),
  mo_ta: z.string().optional().nullable().or(z.literal('')),
});

/**
 * Type inference from schema
 */
export type NhomCauHoiFormData = z.infer<typeof nhomCauHoiFormSchema>;








