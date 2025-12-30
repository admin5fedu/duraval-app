/**
 * Chấm OLE Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { ChamOleDetailView } from "../components/cham-ole-detail-view"
import { chamOleConfig } from "../config"

export default function ChamOleDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(chamOleConfig.routePath)
    return null
  }

  const chamOleId = Number(id)
  if (isNaN(chamOleId)) {
    navigate(chamOleConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${chamOleConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(chamOleConfig.routePath)
  }

  return (
    <ChamOleDetailView
      id={chamOleId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
