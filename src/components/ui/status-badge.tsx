"use client"

import * as React from "react"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"
import { getEnumBadgeClass } from "@/shared/utils/enum-color-registry"

// Design tokens cho các badge trạng thái / enum dùng chung toàn app
// ⚡ Note: These functions now use the enum registry internally for consistency
// Legacy functions are kept for backward compatibility

// 3.1. Tình trạng nhân sự
const EMPLOYEE_STATUS_COLORS: Record<string, string> = {
  "Chính thức": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Thử việc": "bg-amber-50 text-amber-700 border-amber-200",
  "Nghỉ việc": "bg-red-50 text-red-700 border-red-200",
  "Tạm nghỉ": "bg-slate-50 text-slate-700 border-slate-200",
}

export function getEmployeeStatusBadgeClass(
  status: string | null | undefined
): string {
  // Use enum registry if available, fallback to legacy
  try {
    return getEnumBadgeClass("tinh_trang", status)
  } catch {
    // Fallback to legacy implementation
    if (!status) return "bg-muted text-muted-foreground border-transparent"
    return EMPLOYEE_STATUS_COLORS[status] ?? "bg-slate-50 text-slate-700 border-slate-200"
  }
}

// 3.2. Mối quan hệ người thân
const RELATION_COLORS: Record<string, string> = {
  "Bố": "bg-blue-50 text-blue-700 border-blue-200",
  "Mẹ": "bg-pink-50 text-pink-700 border-pink-200",
  "Vợ / Chồng": "bg-purple-50 text-purple-700 border-purple-200",
  "Con": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Người thân": "bg-slate-50 text-slate-700 border-slate-200",
}

export function getRelationBadgeClass(
  relation: string | null | undefined
): string {
  // Use enum registry if available, fallback to legacy
  try {
    return getEnumBadgeClass("moi_quan_he", relation)
  } catch {
    // Fallback to legacy implementation
    if (!relation) return "bg-muted text-muted-foreground border-transparent"
    return RELATION_COLORS[relation] ?? "bg-muted text-foreground border-muted"
  }
}

// 3.3. Giới tính & hôn nhân (nhân sự)
const GENDER_COLORS: Record<string, string> = {
  Nam: "bg-blue-50 text-blue-700 border-blue-200",
  Nữ: "bg-pink-50 text-pink-700 border-pink-200",
  Khác: "bg-purple-50 text-purple-700 border-purple-200",
}

export function getGenderBadgeClass(
  gender: string | null | undefined
): string {
  // Use enum registry if available, fallback to legacy
  try {
    return getEnumBadgeClass("gioi_tinh", gender)
  } catch {
    // Fallback to legacy implementation
    if (!gender) return "bg-muted text-muted-foreground border-transparent"
    return GENDER_COLORS[gender] ?? "bg-slate-50 text-slate-700 border-slate-200"
  }
}

const MARITAL_STATUS_COLORS: Record<string, string> = {
  "Độc thân": "bg-slate-50 text-slate-700 border-slate-200",
  "Đã kết hôn": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Ly dị": "bg-amber-50 text-amber-700 border-amber-200",
}

export function getMaritalStatusBadgeClass(
  status: string | null | undefined
): string {
  // Use enum registry if available, fallback to legacy
  try {
    return getEnumBadgeClass("hon_nhan", status)
  } catch {
    // Fallback to legacy implementation
    if (!status) return "bg-muted text-muted-foreground border-transparent"
    return MARITAL_STATUS_COLORS[status] ?? "bg-slate-50 text-slate-700 border-slate-200"
  }
}

// 3.4. Kết quả trong câu trả lời
const RESULT_COLORS: Record<string, string> = {
  "Đúng": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Sai": "bg-red-50 text-red-700 border-red-200",
  "Chưa chấm": "bg-slate-50 text-slate-700 border-slate-200",
}

export function getResultBadgeClass(
  result: string | null | undefined
): string {
  // Use enum registry if available, fallback to legacy
  try {
    return getEnumBadgeClass("ket_qua", result)
  } catch {
    // Fallback to legacy implementation
    if (!result) return "bg-muted text-muted-foreground border-transparent"
    const key = result.trim()
    return RESULT_COLORS[key] ?? "bg-slate-50 text-slate-700 border-slate-200"
  }
}

// 3.5. Boolean / trạng thái áp dụng (áp dụng / không áp dụng, v.v.)
export function getBooleanBadgeClass(
  value: boolean | string | null | undefined
): string {
  // Use enum registry if available, fallback to legacy
  try {
    return getEnumBadgeClass("ap_dung", value)
  } catch {
    // Fallback to legacy implementation
    if (value === null || value === undefined || value === "") {
      return "bg-muted text-muted-foreground border-transparent"
    }

    let boolValue: boolean | null = null

    if (typeof value === "boolean") {
      boolValue = value
    } else if (typeof value === "string") {
      const normalized = value.trim().toLowerCase()
      if (
        normalized === "true" ||
        normalized === "1" ||
        normalized === "có" ||
        normalized === "co" ||
        normalized === "yes" ||
        normalized === "đúng"
      ) {
        boolValue = true
      } else if (
        normalized === "false" ||
        normalized === "0" ||
        normalized === "không" ||
        normalized === "khong" ||
        normalized === "no"
      ) {
        boolValue = false
      }
    }

    if (boolValue === null) {
      return "bg-muted text-muted-foreground border-transparent"
    }

    return boolValue
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-50 text-slate-600 border-slate-200"
  }
}

// Convenience component nếu cần dùng trực tiếp thay vì tự wrap Badge
export function StatusBadge(props: {
  kind:
    | "employeeStatus"
    | "relation"
    | "gender"
    | "maritalStatus"
    | "result"
    | "boolean"
  value: string | boolean | null | undefined
  className?: string
  children?: React.ReactNode
}) {
  const { kind, value, className, children } = props
  let colorClass = ""

  switch (kind) {
    case "employeeStatus":
      colorClass = getEmployeeStatusBadgeClass(value as string | null | undefined)
      break
    case "relation":
      colorClass = getRelationBadgeClass(value as string | null | undefined)
      break
    case "gender":
      colorClass = getGenderBadgeClass(value as string | null | undefined)
      break
    case "maritalStatus":
      colorClass = getMaritalStatusBadgeClass(value as string | null | undefined)
      break
    case "result":
      colorClass = getResultBadgeClass(value as string | null | undefined)
      break
    case "boolean":
      colorClass = getBooleanBadgeClass(value as boolean | string | null | undefined)
      break
  }

  const content =
    children ??
    (typeof value === "boolean" ? (value ? "Có" : "Không") : String(value ?? ""))

  return (
    <Badge variant="outline" className={cn(colorClass, className)}>
      {content}
    </Badge>
  )
}

