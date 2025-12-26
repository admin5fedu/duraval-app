"use client"

import * as React from "react"

interface MobileCardActionBarProps {
  /**
   * Các action workflow bên trái (Duyệt, Đổi trạng thái, ...).
   * Có thể là một hoặc nhiều nút / phần tử wrap trong Fragment.
   */
  leftActions?: React.ReactNode
  /**
   * Nhóm Sửa / Xóa hoặc các action chính bên phải.
   */
  rightActions?: React.ReactNode
  /**
   * Cho phép bổ sung className nếu cần tinh chỉnh sau này.
   */
  className?: string
}

export function MobileCardActionBar({
  leftActions,
  rightActions,
  className = "",
}: MobileCardActionBarProps) {
  if (!leftActions && !rightActions) return null

  return (
    <div
      className={`flex items-center justify-between ${className}`.trim()}
    >
      <div className="flex gap-2">
        {leftActions}
      </div>
      <div className="flex gap-2">
        {rightActions}
      </div>
    </div>
  )
}

