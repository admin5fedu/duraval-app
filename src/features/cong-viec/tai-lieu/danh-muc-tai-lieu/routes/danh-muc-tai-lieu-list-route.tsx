"use client"

import { useNavigate } from "react-router-dom"
import { DanhMucTaiLieuListView } from "../components"
import { danhMucTaiLieuConfig } from "../config"

/**
 * Route component for Danh Mục Tài Liệu list view
 * Uses explicit route pattern (not orchestrator)
 */
export default function DanhMucTaiLieuListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${danhMucTaiLieuConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${danhMucTaiLieuConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${danhMucTaiLieuConfig.routePath}/${id}`)
  }

  return (
    <DanhMucTaiLieuListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

