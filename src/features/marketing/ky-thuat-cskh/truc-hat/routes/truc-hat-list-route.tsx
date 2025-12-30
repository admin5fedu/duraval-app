/**
 * Trục Hạt List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { TrucHatListView } from "../components/truc-hat-list-view"
import { trucHatConfig } from "../config"

export default function TrucHatListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${trucHatConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${trucHatConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${trucHatConfig.routePath}/${id}`)
  }

  return (
    <TrucHatListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

