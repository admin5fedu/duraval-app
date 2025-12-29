"use client"

import { useAutoFillFields, type AutoFillRule } from "@/shared/hooks/use-auto-fill-fields"
import type { FieldValues } from "react-hook-form"

interface AutoFillFieldsProps<TFieldValues extends FieldValues = FieldValues> {
  /**
   * Rules để tự động điền các field phụ thuộc
   */
  rules: AutoFillRule<TFieldValues>[]
}

/**
 * AutoFillFields Component
 * 
 * Component wrapper cho useAutoFillFields hook.
 * Sử dụng để tự động điền các field phụ thuộc khi source field thay đổi.
 * 
 * ⚡ Pattern: useWatch + useEffect (Imperative cho data mutation)
 * 🎯 Use case: Auto-fill fields dựa trên giá trị của fields khác
 * 
 * @example
 * ```tsx
 * <GenericFormView>
 *   <AutoFillFields 
 *     rules={[
 *       {
 *         watchField: "loai_phieu",
 *         targetFields: [
 *           {
 *             fieldName: "so_gio",
 *             mapper: (loaiPhieu) => {
 *               if (loaiPhieu === "Công tác") return 8
 *               return null
 *             }
 *           }
 *         ]
 *       }
 *     ]}
 *   />
 * </GenericFormView>
 * ```
 */
export function AutoFillFields<TFieldValues extends FieldValues = FieldValues>({
  rules
}: AutoFillFieldsProps<TFieldValues>) {
  useAutoFillFields(rules)
  return null // Component không render gì, chỉ chạy side effects
}

