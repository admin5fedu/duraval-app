import { z } from 'zod';
import { requiredStringSchema, requiredPositiveIntegerSchema } from '@lib/schemas/common/required.schema';

/**
 * CauHoi form schema
 * Validates all fields for question form
 */
export const cauHoiFormSchema = z.object({
  chuyen_de_id: z.preprocess(
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
    requiredPositiveIntegerSchema('Chuyên đề')
  ),
  cau_hoi: requiredStringSchema('Nội dung câu hỏi'),
  dap_an_1: requiredStringSchema('Đáp án 1'),
  dap_an_2: requiredStringSchema('Đáp án 2'),
  dap_an_3: requiredStringSchema('Đáp án 3'),
  dap_an_4: requiredStringSchema('Đáp án 4'),
  dap_an_dung: z
    .number()
    .int('Đáp án đúng phải là số nguyên')
    .min(1, 'Đáp án đúng phải từ 1 đến 4')
    .max(4, 'Đáp án đúng phải từ 1 đến 4'),
  hinh_anh: z.array(z.string().url('URL hình ảnh không đúng định dạng')).optional().default([]),
});

/**
 * Type inference from schema
 */
export type CauHoiFormData = z.infer<typeof cauHoiFormSchema>;

