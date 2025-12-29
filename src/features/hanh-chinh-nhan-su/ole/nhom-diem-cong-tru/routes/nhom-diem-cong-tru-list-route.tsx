/**
 * Nhóm Điểm Cộng Trừ List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { NhomDiemCongTruListView } from "../components/nhom-diem-cong-tru-list-view"
import { nhomDiemCongTruConfig } from "../config"

export default function NhomDiemCongTruListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${nhomDiemCongTruConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${nhomDiemCongTruConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${nhomDiemCongTruConfig.routePath}/${id}`)
  }

  return (
    <NhomDiemCongTruListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}
