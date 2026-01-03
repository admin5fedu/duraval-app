import { z } from 'zod';
import { requiredStringSchema, requiredPositiveIntegerSchema } from '@lib/schemas/common/required.schema';

/**
 * KyThiTrangThai options
 */
export const KY_THI_TRANG_THAI_OPTIONS = ['Mở', 'Đóng'] as const;

/**
 * KyThi form schema
 * Validates all fields for exam form
 */
export const kyThiFormSchema = z
  .object({
    ngay: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không đúng định dạng YYYY-MM-DD')
      .nonempty('Ngày thi là bắt buộc'),
    ten_ky_thi: requiredStringSchema('Tên kỳ thi'),
    so_cau_hoi: requiredPositiveIntegerSchema('Số câu hỏi'),
    so_phut_lam_bai: requiredPositiveIntegerSchema('Thời gian (phút)'),
    nhom_chuyen_de_ids: z.array(z.number().int()).optional().default([]),
    chuyen_de_ids: z.array(z.number().int()).optional().default([]),
    chuc_vu_ids: z.array(z.string()).optional().default([]),
    trang_thai: z.enum(KY_THI_TRANG_THAI_OPTIONS, {
      required_error: 'Vui lòng chọn trạng thái',
    }),
    ghi_chu: z.string().optional().nullable().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Validation sẽ được thực hiện trong component để kiểm tra số câu hỏi
      // Vì cần access đến cauHoiList
      return true;
    },
    {
      message: 'Không đủ câu hỏi trong các chuyên đề đã chọn',
      path: ['so_cau_hoi'],
    }
  );

/**
 * Type inference from schema
 */
export type KyThiFormData = z.infer<typeof kyThiFormSchema>;

