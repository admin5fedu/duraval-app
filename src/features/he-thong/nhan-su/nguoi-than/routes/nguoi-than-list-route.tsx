/**
 * Người Thân List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { NguoiThanListView } from "../components/nguoi-than-list-view"
import { nguoiThanConfig } from "../config"

export default function NguoiThanListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${nguoiThanConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${nguoiThanConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${nguoiThanConfig.routePath}/${id}`)
  }

  return (
    <NguoiThanListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

