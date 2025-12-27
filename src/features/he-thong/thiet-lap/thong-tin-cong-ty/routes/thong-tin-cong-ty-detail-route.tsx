/**
 * Thông Tin Công Ty Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { ThongTinCongTyDetailView } from "../components/thong-tin-cong-ty-detail-view"
import { thongTinCongTyConfig } from "../config"

export default function ThongTinCongTyDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(thongTinCongTyConfig.routePath)
    return null
  }

  const thongTinCongTyId = Number(id)
  if (isNaN(thongTinCongTyId)) {
    navigate(thongTinCongTyConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${thongTinCongTyConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(thongTinCongTyConfig.routePath)
  }

  return (
    <ThongTinCongTyDetailView
      id={thongTinCongTyId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

