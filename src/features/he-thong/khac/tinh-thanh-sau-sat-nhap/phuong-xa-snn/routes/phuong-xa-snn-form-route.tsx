/**
 * Phường xã SNN Form Route
 * 
 * Route component for create/edit form view
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { PhuongXaSNNFormView } from "../components/phuong-xa-snn-form-view"
import { phuongXaSNNConfig } from "../config"

export default function PhuongXaSNNFormRoute() {
  const params = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = params.id === "moi" ? undefined : (params.id ? parseInt(params.id, 10) : undefined)

  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  
  // Preserve page and pageSize from URL
  const page = searchParams.get('page') || '1'
  const pageSize = searchParams.get('pageSize') || '50'
  const returnQuery = `?page=${page}&pageSize=${pageSize}`

  const handleComplete = () => {
    if (returnTo === 'list') {
      navigate(`${phuongXaSNNConfig.routePath}${returnQuery}`)
    } else if (id) {
      navigate(`${phuongXaSNNConfig.routePath}/${id}${returnQuery}`)
    } else {
      navigate(`${phuongXaSNNConfig.routePath}${returnQuery}`)
    }
  }

  const handleCancel = () => {
    if (returnTo === 'list') {
      navigate(`${phuongXaSNNConfig.routePath}${returnQuery}`)
    } else if (id) {
      navigate(`${phuongXaSNNConfig.routePath}/${id}${returnQuery}`)
    } else {
      navigate(`${phuongXaSNNConfig.routePath}${returnQuery}`)
    }
  }

  return (
    <PhuongXaSNNFormView
      id={id}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

