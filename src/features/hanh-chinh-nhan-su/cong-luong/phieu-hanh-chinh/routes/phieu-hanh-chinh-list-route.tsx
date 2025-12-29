/**
 * Phiếu Hành Chính List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { PhieuHanhChinhListView } from "../components/phieu-hanh-chinh-list-view"
import { phieuHanhChinhConfig } from "../config"

export default function PhieuHanhChinhListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${phieuHanhChinhConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${phieuHanhChinhConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${phieuHanhChinhConfig.routePath}/${id}`)
  }

  return (
    <PhieuHanhChinhListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}
