/**
 * Phường xã SNN Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { PhuongXaSNNDetailView } from "../components/phuong-xa-snn-detail-view"
import { phuongXaSNNConfig } from "../config"

export default function PhuongXaSNNDetailRoute() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    navigate(phuongXaSNNConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${phuongXaSNNConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(phuongXaSNNConfig.routePath)
  }

  return (
    <PhuongXaSNNDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

