/**
 * Nhóm Điểm Cộng Trừ Form Route
 */

"use client"

import { useParams } from "react-router-dom"

export default function NhomDiemCongTruFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEditMode ? "Sửa Nhóm Điểm Cộng Trừ" : "Thêm Nhóm Điểm Cộng Trừ"}
      </h1>
      <p className="text-muted-foreground">Module đang được phát triển...</p>
    </div>
  )
}

