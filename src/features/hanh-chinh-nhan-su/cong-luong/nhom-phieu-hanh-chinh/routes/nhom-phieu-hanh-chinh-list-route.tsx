/**
 * Nhóm Phiếu Hành Chính List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { NhomPhieuHanhChinhListView } from "../components/nhom-phieu-hanh-chinh-list-view"
import { nhomPhieuHanhChinhConfig } from "../config"

export default function NhomPhieuHanhChinhListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${nhomPhieuHanhChinhConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}`)
  }

  return (
    <NhomPhieuHanhChinhListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

