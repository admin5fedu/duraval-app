/**
 * Phường xã SNN Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { PhuongXaSNNDetailView } from "../components/phuong-xa-snn-detail-view"
import { phuongXaSNNConfig } from "../config"

export default function PhuongXaSNNDetailRoute() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    navigate(phuongXaSNNConfig.routePath)
    return null
  }

  // Preserve page and pageSize from URL
  const page = searchParams.get('page') || '1'
  const pageSize = searchParams.get('pageSize') || '50'
  const returnQuery = `?page=${page}&pageSize=${pageSize}`

  const handleEdit = () => {
    navigate(`${phuongXaSNNConfig.routePath}/${id}/sua?returnTo=detail${returnQuery.replace('?', '&')}`)
  }

  const handleBack = () => {
    navigate(`${phuongXaSNNConfig.routePath}${returnQuery}`)
  }

  return (
    <PhuongXaSNNDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

