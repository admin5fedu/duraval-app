"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { useHangMucByLoaiPhieuId } from "@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/hang-muc/hooks/use-hang-muc"
import { ToggleButtonFormField } from "@/shared/components/forms/toggle-button-form-field"

interface HangMucToggleFormFieldProps {
  value?: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  id?: string
  name?: string
  onBlur?: () => void
}

/**
 * Custom toggle button field for hang_muc with dynamic options based on loai_phieu_id
 */
export const HangMucToggleFormField = React.forwardRef<HTMLDivElement, HangMucToggleFormFieldProps>(
function HangMucToggleFormField({
  value,
  onChange,
  disabled,
  id,
  onBlur,
}) {
  const { watch } = useFormContext()
  const loaiPhieuIdStr = watch("loai_phieu_id")
  const loaiPhieuId = loaiPhieuIdStr ? Number(loaiPhieuIdStr) : null
  const { data: hangMucList } = useHangMucByLoaiPhieuId(loaiPhieuId || 0)

  const options = React.useMemo(() => {
    if (!hangMucList || !loaiPhieuId) return []
    return hangMucList
      .filter(hm => hm.id !== undefined)
      .map(hm => ({
        label: hm.ten_hang_muc || `ID: ${hm.id}`,
        value: String(hm.id)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [hangMucList, loaiPhieuId])

  // Clear value when loai_phieu_id changes
  React.useEffect(() => {
    if (!loaiPhieuId) {
      onChange(null)
    }
  }, [loaiPhieuId, onChange])

  return (
    <ToggleButtonFormField
      value={value || ""}
      onChange={(val) => onChange(val || null)}
      options={options}
      disabled={disabled || !loaiPhieuId}
      id={id}
      onBlur={onBlur}
    />
  )
})

HangMucToggleFormField.displayName = "HangMucToggleFormField"

