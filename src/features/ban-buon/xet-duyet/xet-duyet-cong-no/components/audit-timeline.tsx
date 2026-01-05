"use client"

import * as React from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CheckCircle2, XCircle, Clock, RotateCcw, User } from "lucide-react"
import { type AuditLog, type AuditLogItem } from "../utils/trang-thai-utils"

interface AuditTimelineProps {
  auditLog: AuditLog | null | undefined
  nguoiTao?: string | null
  tgTao?: string | null
}

export function AuditTimeline({ auditLog, nguoiTao, tgTao }: AuditTimelineProps) {
  const items: (AuditLogItem & { isCreate?: boolean })[] = React.useMemo(() => {
    const result: (AuditLogItem & { isCreate?: boolean })[] = []
    
    // Thêm entry "Tạo mới" nếu có
    if (nguoiTao && tgTao) {
      result.push({
        action: "Tạo mới",
        user: nguoiTao,
        user_id: null,
        time: tgTao,
        isCreate: true,
      })
    }
    
    // Thêm các entry từ audit log
    if (auditLog?.history) {
      result.push(...auditLog.history)
    }
    
    // Sắp xếp theo thời gian
    return result.sort((a, b) => {
      const timeA = new Date(a.time).getTime()
      const timeB = new Date(b.time).getTime()
      return timeA - timeB
    })
  }, [auditLog, nguoiTao, tgTao])

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Chưa có lịch sử duyệt
      </div>
    )
  }

  const getIcon = (action: string) => {
    if (action.includes("Tạo mới")) {
      return <User className="h-4 w-4" />
    }
    if (action.includes("Đồng ý")) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    if (action.includes("Từ chối")) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (action.includes("Yêu cầu bổ sung") || action.includes("Trả lại")) {
      return <RotateCcw className="h-4 w-4 text-yellow-500" />
    }
    return <Clock className="h-4 w-4 text-blue-500" />
  }

  const getColor = (action: string) => {
    if (action.includes("Tạo mới")) {
      return "bg-blue-500"
    }
    if (action.includes("Đồng ý")) {
      return "bg-green-500"
    }
    if (action.includes("Từ chối")) {
      return "bg-red-500"
    }
    if (action.includes("Yêu cầu bổ sung") || action.includes("Trả lại")) {
      return "bg-yellow-500"
    }
    return "bg-gray-500"
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4 relative">
          {/* Timeline line */}
          {index < items.length - 1 && (
            <div className="absolute left-2 top-8 w-0.5 h-full bg-border" />
          )}
          
          {/* Icon */}
          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getColor(item.action)} text-white shrink-0`}>
            {getIcon(item.action)}
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{item.action}</div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(item.time), "dd/MM/yyyy HH:mm", { locale: vi })}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {item.user}
              {item.level && (
                <span className="ml-2 text-xs">
                  ({item.level === "quan_ly" ? "Quản lý" : "BGD"})
                </span>
              )}
            </div>
            {item.note && (
              <div className="text-sm text-foreground bg-muted p-2 rounded-md mt-2">
                {item.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

