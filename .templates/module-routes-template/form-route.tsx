/**
 * {ModuleName} Form Route
 * 
 * Route component for form view (create/edit)
 * 
 * Generated from template - update module name and imports
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { {ModuleName}FormView } from "../components/{module-name}-form-view"
import { {moduleName}Config } from "../config"

export default function {ModuleName}FormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const itemId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!itemId || isNaN(itemId))) {
    navigate({moduleName}Config.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && itemId) {
      // After edit, go to detail view
      navigate(`${{moduleName}Config.routePath}/${itemId}`)
    } else {
      // After create, go to list view
      navigate({moduleName}Config.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && itemId) {
      // Return to detail view
      navigate(`${{moduleName}Config.routePath}/${itemId}`)
    } else {
      // Return to list view
      navigate({moduleName}Config.routePath)
    }
  }

  return (
    <{ModuleName}FormView
      id={isEditMode ? itemId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

