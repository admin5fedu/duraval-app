import { requiredPositiveIntegerSchema } from '@lib/schemas/common/required.schema';
import { z } from 'zod';

/**
 * CauTraLoi form schema
 * Validates all fields for answer form
 */
export const cauTraLoiFormSchema = z.object({
  lich_dang_id: requiredPositiveIntegerSchema('Lịch đăng'),
  cau_hoi_id: requiredPositiveIntegerSchema('Câu hỏi'),
  cau_tra_loi: z.enum(['1', '2', '3', '4'], {
    required_error: 'Vui lòng chọn câu trả lời',
  }),
});

/**
 * Type inference from schema
 */
export type CauTraLoiFormData = z.infer<typeof cauTraLoiFormSchema>;

