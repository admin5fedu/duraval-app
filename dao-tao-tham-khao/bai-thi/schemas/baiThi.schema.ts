import { z } from 'zod';
import { requiredPositiveIntegerSchema } from '@lib/schemas/common/required.schema';

/**
 * BaiThiTrangThai options
 */
export const BAI_THI_TRANG_THAI_OPTIONS = [
  'Chưa thi',
  'Đang thi',
  'Đạt',
  'Không đạt',
] as const;

/**
 * BaiThi form schema
 * Validates all fields for exam attempt form
 */
export const baiThiFormSchema = z.object({
  ky_thi_id: requiredPositiveIntegerSchema('Kỳ thi'),
  nhan_vien_id: requiredPositiveIntegerSchema('Nhân viên'),
  ngay_lam_bai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không đúng định dạng YYYY-MM-DD').optional().nullable().or(z.literal('')),
  thoi_gian_bat_dau: z.string().optional().nullable().or(z.literal('')),
  thoi_gian_ket_thuc: z.string().optional().nullable().or(z.literal('')),
  diem_so: z.number().int('Điểm số phải là số nguyên').min(0, 'Điểm số không được âm').nullable().optional(),
  tong_so_cau: z.number().int('Tổng số câu phải là số nguyên').min(1, 'Tổng số câu phải lớn hơn 0').nullable().optional(),
  trang_thai: z.enum(BAI_THI_TRANG_THAI_OPTIONS, {
    required_error: 'Vui lòng chọn trạng thái',
  }),
});

/**
 * Type inference from schema
 */
export type BaiThiFormData = z.infer<typeof baiThiFormSchema>;

