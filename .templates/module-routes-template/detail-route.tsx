/**
 * {ModuleName} Detail Route
 * 
 * Route component for detail view
 * 
 * Generated from template - update module name and imports
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { {ModuleName}DetailView } from "../components/{module-name}-detail-view"
import { {moduleName}Config } from "../config"

export default function {ModuleName}DetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate({moduleName}Config.routePath)
    return null
  }

  const itemId = Number(id)
  if (isNaN(itemId)) {
    navigate({moduleName}Config.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${{moduleName}Config.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate({moduleName}Config.routePath)
  }

  return (
    <{ModuleName}DetailView
      id={itemId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

