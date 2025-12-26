/**
 * Generate Routes from Module Config
 * 
 * Utility to automatically generate route configurations from module registry
 * Supports both explicit routes (preferred) and splat routes (legacy)
 */

import { lazy } from "react"
import { RouteConfig } from "@/routes"
import { moduleRegistry } from "@/shared/config/module-registry"
import { generateModuleRoutes } from "./generate-explicit-routes"

/**
 * Generate route configs from module registry
 * 
 * Prefers explicit routes over splat routes (routePattern)
 * 
 * @returns Array of RouteConfig for all registered modules
 */
export function generateRoutesFromConfig(): RouteConfig[] {
  const moduleRoutes: RouteConfig[] = []
  
  moduleRegistry.getAll().forEach(config => {
    if (config.routePath) {
      // Prefer explicit routes (new pattern)
      // Check if routes folder exists by trying to generate explicit routes
      try {
        const explicitRoutes = generateModuleRoutes(config)
        if (explicitRoutes.length > 0) {
          moduleRoutes.push(...explicitRoutes)
          return // Skip splat route generation
        }
      } catch (error) {
        // If explicit routes don't exist, fall back to splat route
        console.warn(`Explicit routes not found for ${config.moduleName}, using splat route`)
      }
    }
    
    // Fallback to splat route (legacy pattern)
    if (config.routePattern) {
      const modulePath = getModuleImportPath(config.moduleName)
      
      moduleRoutes.push({
        path: config.routePattern,
        element: lazy(() => import(modulePath)),
        protected: true,
        layout: true,
      })
    }
  })
  
  return moduleRoutes
}

/**
 * Get module import path from module name
 * 
 * @param moduleName - Module name (e.g., "danh-sach-nhan-su")
 * @returns Import path (e.g., "@/features/he-thong/nhan-su/danh-sach-nhan-su/index")
 */
function getModuleImportPath(moduleName: string): string {
  // Map module names to their actual import paths
  // This mapping should match the actual folder structure
  const modulePathMap: Record<string, string> = {
    "danh-sach-nhan-su": "@/features/he-thong/nhan-su/danh-sach-nhan-su/index",
    // Add more mappings as modules are added
  }
  
  // If we have a mapping, use it
  if (modulePathMap[moduleName]) {
    return modulePathMap[moduleName]
  }
  
  // Fallback: try to infer from moduleName
  // For nested modules like "he-thong/nhan-su/danh-sach-nhan-su"
  if (moduleName.includes('/')) {
    return `@/features/${moduleName}/index`
  }
  
  // Default pattern
  return `@/features/${moduleName}/index`
}

/**
 * Get route config for a specific module
 * 
 * Prefers explicit routes over splat routes
 */
export function getRouteConfigForModule(moduleName: string): RouteConfig[] | null {
  const config = moduleRegistry.get(moduleName)
  if (!config || !config.routePath) {
    return null
  }
  
  // Try explicit routes first
  try {
    const explicitRoutes = generateModuleRoutes(config)
    if (explicitRoutes.length > 0) {
      return explicitRoutes
    }
  } catch (error) {
    // Fall back to splat route
  }
  
  // Fallback to splat route (legacy)
  if (config.routePattern) {
    const modulePath = getModuleImportPath(config.moduleName)
    
    return [{
      path: config.routePattern,
      element: lazy(() => import(modulePath)),
      protected: true,
      layout: true,
    }]
  }
  
  return null
}

