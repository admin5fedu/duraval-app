/**
 * Nhân Sự Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { NhanSuDetailView } from "../components/nhan-su-detail-view"
import { nhanSuConfig } from "../config"

export default function NhanSuDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(nhanSuConfig.routePath)
    return null
  }

  const nhanSuId = Number(id)
  if (isNaN(nhanSuId)) {
    navigate(nhanSuConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${nhanSuConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(nhanSuConfig.routePath)
  }

  return (
    <NhanSuDetailView
      id={nhanSuId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

