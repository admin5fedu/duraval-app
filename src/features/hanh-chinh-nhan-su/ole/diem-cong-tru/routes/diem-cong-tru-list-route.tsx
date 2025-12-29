/**
 * Điểm Cộng Trừ List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { DiemCongTruListView } from "../components/diem-cong-tru-list-view"
import { diemCongTruConfig } from "../config"

export default function DiemCongTruListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${diemCongTruConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${diemCongTruConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${diemCongTruConfig.routePath}/${id}`)
  }

  return (
    <DiemCongTruListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}
