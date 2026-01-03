import { z } from 'zod';
import { requiredStringSchema } from '@lib/schemas/common/required.schema';
import { requiredPositiveIntegerSchema } from '@lib/schemas/common/required.schema';

/**
 * ChuyenDe (Training Topic) form schema
 * Validates all fields for training topic form
 */
export const chuyenDeTopicFormSchema = z.object({
  nhom_id: z.preprocess(
    (val) => {
      // Handle empty string, null, or undefined from FormSelectRHF
      if (val === '' || val === null || val === undefined) {
        return undefined;
      }
      // Convert string to number if needed
      if (typeof val === 'string') {
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    requiredPositiveIntegerSchema('Nhóm chuyên đề')
  ),
  ten_chuyen_de: requiredStringSchema('Tên chuyên đề'),
  ghi_chu: z.string().optional().nullable().or(z.literal('')),
});

/**
 * Type inference from schema
 */
export type ChuyenDeTopicFormData = z.infer<typeof chuyenDeTopicFormSchema>;

