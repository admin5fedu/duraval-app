/**
 * Chấm OLE List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { ChamOleListView } from "../components/cham-ole-list-view"
import { chamOleConfig } from "../config"

export default function ChamOleListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${chamOleConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${chamOleConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${chamOleConfig.routePath}/${id}`)
  }

  return (
    <ChamOleListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}
