"use client"

import { useParams, useNavigate } from "react-router-dom"
import { TaiLieuBieuMauDetailView } from "../components"
import { taiLieuBieuMauConfig } from "../config"

/**
 * Route component for Tài Liệu & Biểu Mẫu detail view
 * Uses explicit route pattern (not orchestrator)
 */
export default function TaiLieuBieuMauDetailRoute() {
  const params = useParams()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">ID không hợp lệ</p>
          <button 
            onClick={() => navigate(taiLieuBieuMauConfig.routePath)}
            className="text-primary hover:underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    navigate(`${taiLieuBieuMauConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(taiLieuBieuMauConfig.routePath)
  }

  return (
    <TaiLieuBieuMauDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

