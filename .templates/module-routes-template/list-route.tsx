/**
 * {ModuleName} List Route
 * 
 * Route component for list view
 * 
 * Generated from template - update module name and imports
 */

"use client"

import { useNavigate } from "react-router-dom"
import { {ModuleName}ListView } from "../components/{module-name}-list-view"
import { {moduleName}Config } from "../config"

export default function {ModuleName}ListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${{moduleName}Config.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${{moduleName}Config.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${{moduleName}Config.routePath}/${id}`)
  }

  return (
    <{ModuleName}ListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

