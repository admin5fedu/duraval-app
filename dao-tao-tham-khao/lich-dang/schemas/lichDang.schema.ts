import { z } from 'zod';
import { requiredStringSchema, requiredPositiveIntegerSchema } from '@lib/schemas/common/required.schema';

/**
 * LichDang form schema
 * Validates all fields for schedule form
 */
export const lichDangFormSchema = z
  .object({
    ngay_hen: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không đúng định dạng YYYY-MM-DD')
      .nonempty('Ngày hẹn là bắt buộc'),
    gio_bat_dau: requiredStringSchema('Giờ bắt đầu'),
    gio_ket_thuc: requiredStringSchema('Giờ kết thúc'),
    nhom_cau_hoi_id: requiredPositiveIntegerSchema('Nhóm câu hỏi'),
    cau_hoi_id: requiredPositiveIntegerSchema('Câu hỏi'),
    chuc_vu_ids: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      // Validation: gio_bat_dau < gio_ket_thuc
      if (data.gio_bat_dau && data.gio_ket_thuc) {
        return data.gio_bat_dau < data.gio_ket_thuc;
      }
      return true;
    },
    {
      message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu',
      path: ['gio_ket_thuc'],
    }
  );

/**
 * Type inference from schema
 */
export type LichDangFormData = z.infer<typeof lichDangFormSchema>;

