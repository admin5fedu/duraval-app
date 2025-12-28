/**
 * Ứng Viên Form Route
 */

"use client"

import { useParams } from "react-router-dom"

export default function UngVienFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEditMode ? "Sửa Ứng Viên" : "Thêm Ứng Viên"}
      </h1>
      <p className="text-muted-foreground">Module đang được phát triển...</p>
    </div>
  )
}

