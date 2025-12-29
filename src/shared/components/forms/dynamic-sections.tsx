"use client"

import * as React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import type { FormSection } from "./generic-form-view/types"
import { FormSectionCard } from "./form-section-card"
import { formSectionContainerClass } from "@/shared/utils/section-styles"

interface DynamicSectionsProps {
  /**
   * Function để generate sections dựa trên form values
   * Sử dụng declarative pattern - sẽ tự động re-compute khi dependencies thay đổi
   */
  getSections: (formValues: Record<string, any>) => FormSection[]
  
  /**
   * Optional: Chỉ định các fields cần watch
   * Nếu không được chỉ định, sẽ watch tất cả form values
   * Hữu ích để optimize performance khi chỉ cần watch một số fields cụ thể
   */
  watchFields?: string[]
}

/**
 * DynamicSections Component
 * 
 * Component để render sections động dựa trên form values.
 * Sử dụng useWatch + useMemo pattern (Declarative) để đảm bảo performance tối ưu.
 * 
 * ⚡ Performance: Chỉ re-compute sections khi watched fields thay đổi
 * 🎯 Declarative: Sections được tính toán tự động, không cần quản lý state
 * 
 * @example
 * ```tsx
 * <GenericFormView sections={[]}>
 *   <DynamicSections 
 *     getSections={(formValues) => {
 *       const loaiPhieu = formValues.loai_phieu
 *       // Return sections based on loaiPhieu
 *       return getSectionsForLoaiPhieu(loaiPhieu)
 *     }}
 *     watchFields={["loai_phieu"]} // Chỉ watch loai_phieu field
 *   />
 * </GenericFormView>
 * ```
 */
export function DynamicSections({ getSections, watchFields }: DynamicSectionsProps) {
  const form = useFormContext()
  
  // Watch tất cả form values để trigger re-render khi bất kỳ field nào thay đổi
  // Note: React hooks rules không cho phép conditional hooks,
  // nên ta luôn watch tất cả fields. getSections sẽ tự filter các fields cần thiết.
  const watchedValues = useWatch({ control: form.control })
  
  // Extract form values - chỉ lấy các fields cần thiết nếu watchFields được chỉ định
  // Điều này giúp getSections chỉ nhận các fields liên quan, dễ debug hơn
  const formValues = React.useMemo(() => {
    const allValues = form.getValues()
    
    if (watchFields && watchFields.length > 0) {
      // Chỉ extract các fields được chỉ định
      const filtered: Record<string, any> = {}
      watchFields.forEach(field => {
        filtered[field] = allValues[field]
      })
      return filtered
    }
    
    // Return tất cả values
    return allValues
  }, [form, watchFields, watchedValues]) // watchedValues để trigger re-compute
  
  // ⚡ Declarative: Tự động re-compute sections khi formValues thay đổi
  // useMemo đảm bảo chỉ tính toán lại khi dependencies thay đổi
  const sections = React.useMemo(() => {
    return getSections(formValues)
  }, [formValues, getSections])
  
  return (
    <div className={formSectionContainerClass()}>
      {sections.map((section, index) => (
        <FormSectionCard key={index} section={section} form={form} />
      ))}
    </div>
  )
}

