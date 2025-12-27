/**
 * Phòng Ban List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { PhongBanListView } from "../components/phong-ban-list-view"
import { phongBanConfig } from "../config"

export default function PhongBanListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${phongBanConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${phongBanConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${phongBanConfig.routePath}/${id}`)
  }

  return (
    <PhongBanListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

