/**
 * Action Hierarchy System
 * 
 * Định nghĩa hệ thống phân cấp actions để đảm bảo UI nhất quán
 * trong toàn bộ ứng dụng.
 * 
 * 4 cấp độ action:
 * - Primary: Action chính, quan trọng nhất (ví dụ: Lưu, Xuất Excel)
 * - Secondary: Action hỗ trợ (ví dụ: Hủy, Lọc, Tìm kiếm)
 * - Tertiary: Action phụ (ví dụ: Đặt lại, Làm mới)
 * - Default: Action thường, không cần nhấn mạnh (ví dụ: Xem chi tiết, Lịch sử)
 */

import type { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"

/**
 * Action hierarchy levels theo thứ tự ưu tiên visual
 */
export type ActionLevel = "primary" | "secondary" | "tertiary" | "default"

/**
 * Mapping action level -> button variant
 * Dựa trên design system hiện tại của app
 */
export const ACTION_LEVEL_VARIANTS: Record<
  ActionLevel,
  VariantProps<typeof buttonVariants>["variant"]
> = {
  primary: "default", // bg-primary (màu chủ đạo, nổi bật nhất)
  secondary: "outline", // border, subtle background
  tertiary: "secondary", // bg-secondary (màu nhạt hơn)
  default: "ghost", // Transparent, chỉ hiện khi hover
}

/**
 * Mapping action level -> recommended button size
 */
export const ACTION_LEVEL_SIZES: Record<
  ActionLevel,
  VariantProps<typeof buttonVariants>["size"]
> = {
  primary: "default", // h-9 px-4
  secondary: "sm", // h-8 px-3
  tertiary: "sm", // h-8 px-3
  default: "sm", // h-8 px-3
}

