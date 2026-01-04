"use client"

import * as React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useMemo, useEffect } from "react"
import {
  FormControl,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTrangThaiKhachBuon } from "@/features/ban-buon/thiet-lap-khach-buon/trang-thai-khach-buon/hooks/use-trang-thai-khach-buon"

interface TrangThaiSelectDependentProps {
  name: string
  label?: string
  required?: boolean
  disabled?: boolean
  id?: string // ID từ FormControl
  onBlur?: () => void // onBlur từ FormControl
}

export const TrangThaiSelectDependent = React.forwardRef<HTMLButtonElement, TrangThaiSelectDependentProps>(
function TrangThaiSelectDependent({
  name,
  disabled = false,
  id,
  onBlur,
}, ref) {
  const { control, setValue } = useFormContext()
  const giaiDoanId = useWatch({ control, name: "giai_doan_id" })
  const currentValue = useWatch({ control, name })
  const { data: trangThaiList } = useTrangThaiKhachBuon(undefined)

  // Filter trạng thái theo giai_doan_id
  const filteredTrangThaiOptions = useMemo(() => {
    if (!trangThaiList) return []
    if (!giaiDoanId) return []
    
    const giaiDoanIdNum = typeof giaiDoanId === 'string' ? parseFloat(giaiDoanId) : giaiDoanId
    if (isNaN(giaiDoanIdNum)) return []
    
    return trangThaiList
      .filter((tt: any) => tt.giai_doan_id === giaiDoanIdNum)
      .map((item: any) => ({
        label: item.ten_trang_thai || `Trạng thái ${item.id}`,
        value: String(item.id)
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label))
  }, [trangThaiList, giaiDoanId])

  // Reset trạng thái khi giai đoạn thay đổi
  useEffect(() => {
    if (giaiDoanId && currentValue) {
      const giaiDoanIdNum = typeof giaiDoanId === 'string' ? parseFloat(giaiDoanId) : giaiDoanId
      if (!isNaN(giaiDoanIdNum)) {
        const currentTrangThai = trangThaiList?.find((tt: any) => tt.id === parseFloat(currentValue))
        // Nếu trạng thái hiện tại không thuộc giai đoạn mới, reset nó
        if (currentTrangThai && currentTrangThai.giai_doan_id !== giaiDoanIdNum) {
          setValue(name, "", { shouldValidate: false })
        }
      }
    } else if (!giaiDoanId && currentValue) {
      // Nếu không có giai đoạn, reset trạng thái
      setValue(name, "", { shouldValidate: false })
    }
  }, [giaiDoanId, currentValue, trangThaiList, name, setValue])

  return (
    <Select
      value={currentValue || ""}
      onValueChange={(value) => {
        setValue(name, value === "" ? null : value, { shouldValidate: true })
      }}
      disabled={disabled || !giaiDoanId || filteredTrangThaiOptions.length === 0}
    >
      <FormControl>
        <SelectTrigger
          ref={ref}
          id={id}
          onBlur={onBlur}
        >
          <SelectValue placeholder={giaiDoanId ? "Chọn trạng thái..." : "Chọn giai đoạn trước"} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {filteredTrangThaiOptions.length === 0 ? (
          <div className="py-2 px-3 text-sm text-muted-foreground">
            {giaiDoanId ? "Không có trạng thái nào" : "Vui lòng chọn giai đoạn trước"}
          </div>
        ) : (
          filteredTrangThaiOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
})

TrangThaiSelectDependent.displayName = "TrangThaiSelectDependent"

