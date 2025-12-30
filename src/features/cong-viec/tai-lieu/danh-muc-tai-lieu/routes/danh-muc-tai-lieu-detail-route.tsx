"use client"

import { useParams, useNavigate } from "react-router-dom"
import { DanhMucTaiLieuDetailView } from "../components"
import { danhMucTaiLieuConfig } from "../config"

/**
 * Route component for Danh Mục Tài Liệu detail view
 * Uses explicit route pattern (not orchestrator)
 */
export default function DanhMucTaiLieuDetailRoute() {
  const params = useParams()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">ID không hợp lệ</p>
          <button 
            onClick={() => navigate(danhMucTaiLieuConfig.routePath)}
            className="text-primary hover:underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    navigate(`${danhMucTaiLieuConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(danhMucTaiLieuConfig.routePath)
  }

  return (
    <DanhMucTaiLieuDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

