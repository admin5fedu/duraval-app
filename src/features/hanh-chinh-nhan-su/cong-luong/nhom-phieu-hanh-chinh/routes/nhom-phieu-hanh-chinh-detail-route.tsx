/**
 * Nhóm Phiếu Hành Chính Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { NhomPhieuHanhChinhDetailView } from "../components/nhom-phieu-hanh-chinh-detail-view"
import { nhomPhieuHanhChinhConfig } from "../config"

export default function NhomPhieuHanhChinhDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(nhomPhieuHanhChinhConfig.routePath)
    return null
  }

  const nhomPhieuId = Number(id)
  if (isNaN(nhomPhieuId)) {
    navigate(nhomPhieuHanhChinhConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(nhomPhieuHanhChinhConfig.routePath)
  }

  return (
    <NhomPhieuHanhChinhDetailView
      id={nhomPhieuId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

