/**
 * Bảng Lương Form Route
 */

"use client"

import { useParams } from "react-router-dom"

export default function BangLuongFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEditMode ? "Sửa Bảng Lương" : "Thêm Bảng Lương"}
      </h1>
      <p className="text-muted-foreground">Module đang được phát triển...</p>
    </div>
  )
}

