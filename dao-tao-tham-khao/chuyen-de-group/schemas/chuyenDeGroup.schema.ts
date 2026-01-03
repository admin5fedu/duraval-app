import { z } from 'zod';
import { requiredStringSchema } from '@lib/schemas/common/required.schema';

/**
 * ChuyenDeNhom (Training Topic Group) form schema
 * Validates all fields for training topic group form
 */
export const chuyenDeGroupFormSchema = z.object({
  ten_nhom: requiredStringSchema('Tên nhóm'),
});

/**
 * Type inference from schema
 */
export type ChuyenDeGroupFormData = z.infer<typeof chuyenDeGroupFormSchema>;

