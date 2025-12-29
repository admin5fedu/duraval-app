/**
 * Nhóm Lương Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { NhomLuongDetailView } from "../components/nhom-luong-detail-view"
import { nhomLuongConfig } from "../config"

export default function NhomLuongDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(nhomLuongConfig.routePath)
    return null
  }

  const nhomLuongId = Number(id)
  if (isNaN(nhomLuongId)) {
    navigate(nhomLuongConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${nhomLuongConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(nhomLuongConfig.routePath)
  }

  return (
    <NhomLuongDetailView
      id={nhomLuongId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

