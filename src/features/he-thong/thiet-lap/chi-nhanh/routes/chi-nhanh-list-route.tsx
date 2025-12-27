/**
 * Chi Nhánh List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { ChiNhanhListView } from "../components/chi-nhanh-list-view"
import { chiNhanhConfig } from "../config"

export default function ChiNhanhListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${chiNhanhConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${chiNhanhConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${chiNhanhConfig.routePath}/${id}`)
  }

  return (
    <ChiNhanhListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

