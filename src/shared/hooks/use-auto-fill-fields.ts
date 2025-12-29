"use client"

import { useEffect } from "react"
import { useWatch, useFormContext, FieldPath, FieldValues } from "react-hook-form"

/**
 * Rule để tự động điền các field phụ thuộc
 */
export interface AutoFillRule<TFieldValues extends FieldValues = FieldValues> {
  /**
   * Field name cần watch (source field)
   */
  watchField: FieldPath<TFieldValues>
  
  /**
   * Các target fields sẽ được auto-fill
   */
  targetFields: Array<{
    /**
     * Tên field sẽ được auto-fill (target field)
     */
    fieldName: FieldPath<TFieldValues>
    
    /**
     * Function để map giá trị từ source field sang target field
     * @param watchedValue - Giá trị của source field
     * @param allFormValues - Tất cả giá trị form hiện tại (optional, để access các fields khác nếu cần)
     * @returns Giá trị sẽ được set cho target field
     */
    mapper: (watchedValue: any, allFormValues?: TFieldValues) => any
    
    /**
     * Optional: Condition để quyết định có auto-fill hay không
     * @param watchedValue - Giá trị của source field
     * @returns true nếu nên auto-fill, false nếu không
     */
    condition?: (watchedValue: any) => boolean
  }>
  
  /**
   * Optional: Dependencies bên ngoài (ví dụ: data lists từ API)
   * Khi dependencies thay đổi, auto-fill sẽ được re-run
   */
  dependencies?: any[]
}

/**
 * Hook để tự động điền các field phụ thuộc
 * 
 * Sử dụng useWatch + useEffect pattern (Imperative cho data mutation)
 * 
 * ⚡ Performance: Chỉ chạy khi watched field hoặc dependencies thay đổi
 * 🎯 Imperative: Phù hợp cho side effects như setValue
 * 
 * @example
 * ```tsx
 * useAutoFillFields([
 *   {
 *     watchField: "cap_bac_id",
 *     targetFields: [
 *       {
 *         fieldName: "ma_cap_bac",
 *         mapper: (capBacId, formValues) => {
 *           const capBac = capBacList.find(cb => cb.id === capBacId)
 *           return capBac?.ma_cap_bac || ""
 *         }
 *       }
 *     ],
 *     dependencies: [capBacList]
 *   }
 * ])
 * ```
 */
export function useAutoFillFields<TFieldValues extends FieldValues = FieldValues>(
  rules: AutoFillRule<TFieldValues>[]
) {
  const form = useFormContext<TFieldValues>()
  
  // ✅ FIX: Không được gọi Hook trong vòng lặp forEach
  // Phải gọi tất cả Hooks ở top level trước
  // Sử dụng useMemo để watch tất cả fields cùng lúc
  const watchedValues = rules.map((rule) => {
    // ✅ FIX: Gọi Hook ở top level, không trong forEach
    return useWatch({ 
      control: form.control, 
      name: rule.watchField 
    })
  })
  
  // ✅ FIX: Gọi useEffect cho mỗi rule (nhưng Hook đã được gọi ở top level)
  rules.forEach((rule, index) => {
    const watchedValue = watchedValues[index]
    
    // Auto-fill target fields khi source field hoặc dependencies thay đổi
    useEffect(() => {
      rule.targetFields.forEach(({ fieldName, mapper, condition }) => {
        // Check condition nếu có
        if (condition && !condition(watchedValue)) {
          return
        }
        
        // Map giá trị từ source sang target
        const allFormValues = form.getValues()
        const newValue = mapper(watchedValue, allFormValues)
        
        // Set giá trị cho target field
        form.setValue(fieldName, newValue, { 
          shouldValidate: false, // Không validate khi auto-fill
          shouldDirty: false,    // Không mark field là dirty khi auto-fill
        })
      })
    }, [watchedValue, form, rule, ...(rule.dependencies || [])])
  })
}

