"use client"

import { useNavigate } from "react-router-dom"
import { TaiLieuBieuMauListView } from "../components"
import { taiLieuBieuMauConfig } from "../config"

/**
 * Route component for Tài Liệu & Biểu Mẫu list view
 * Uses explicit route pattern (not orchestrator)
 */
export default function TaiLieuBieuMauListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${taiLieuBieuMauConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${taiLieuBieuMauConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${taiLieuBieuMauConfig.routePath}/${id}`)
  }

  return (
    <TaiLieuBieuMauListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

