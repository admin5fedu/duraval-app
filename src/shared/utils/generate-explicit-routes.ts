/**
 * Generate Explicit Routes from Module Config
 * 
 * Utility to automatically generate explicit route configurations
 * (no splat pattern) from module registry
 * 
 * Tự động thêm scroll behavior cho các routes:
 * - ListView: 'restore' - restore scroll position khi quay lại
 * - DetailView: 'top' - luôn scroll to top
 * - FormView: 'top' - luôn scroll to top
 */

import { lazy } from "react"
import { RouteConfig } from "@/routes"
import { ModuleConfig } from "@/shared/types/module-config"
import { getDefaultScrollBehavior } from "./route-scroll-behavior-helper"

/**
 * Generate explicit routes for a module
 * 
 * Creates 4 routes:
 * 1. /basePath/moi - New form
 * 2. /basePath/:id/sua - Edit form
 * 3. /basePath/:id - Detail view
 * 4. /basePath - List view
 * 
 * @param config - Module configuration
 * @returns Array of RouteConfig for the module
 */
export function generateModuleRoutes(config: ModuleConfig): RouteConfig[] {
  const { routePath, moduleName } = config
  
  if (!routePath) {
    return []
  }

  // Get route components import paths
  const routesPath = getRoutesImportPath(moduleName)
  
  const routes: RouteConfig[] = [
    // 1. New form route - must come before :id route
    {
      path: `${routePath}/moi`,
      element: lazy(() => import(`${routesPath}/form-route`)),
      protected: true,
      layout: true,
      scrollBehavior: getDefaultScrollBehavior(`${routePath}/moi`, 'form'),
    },
    // 2. Edit form route
    {
      path: `${routePath}/:id/sua`,
      element: lazy(() => import(`${routesPath}/form-route`)),
      protected: true,
      layout: true,
      scrollBehavior: getDefaultScrollBehavior(`${routePath}/:id/sua`, 'form'),
    },
    // 3. Detail view route
    {
      path: `${routePath}/:id`,
      element: lazy(() => import(`${routesPath}/detail-route`)),
      protected: true,
      layout: true,
      scrollBehavior: getDefaultScrollBehavior(`${routePath}/:id`, 'detail'),
    },
    // 4. List view route - must come last
    {
      path: routePath,
      element: lazy(() => import(`${routesPath}/list-route`)),
      protected: true,
      layout: true,
      scrollBehavior: getDefaultScrollBehavior(routePath, 'list'),
    },
  ]

  return routes
}

/**
 * Get routes import path from module name
 * 
 * @param moduleName - Module name (e.g., "danh-sach-nhan-su")
 * @returns Import path base (e.g., "@/features/he-thong/nhan-su/danh-sach-nhan-su/routes")
 */
function getRoutesImportPath(moduleName: string): string {
  // Map module names to their actual import paths
  const modulePathMap: Record<string, string> = {
    "danh-sach-nhan-su": "@/features/he-thong/nhan-su/danh-sach-nhan-su/routes",
    // Add more mappings as modules are added
  }
  
  // If we have a mapping, use it
  if (modulePathMap[moduleName]) {
    return modulePathMap[moduleName]
  }
  
  // Fallback: try to infer from moduleName
  // For nested modules like "he-thong/nhan-su/danh-sach-nhan-su"
  if (moduleName.includes('/')) {
    return `@/features/${moduleName}/routes`
  }
  
  // Default pattern - assumes module is in features root
  return `@/features/${moduleName}/routes`
}

/**
 * Generate explicit routes for all modules in registry
 * 
 * @returns Array of RouteConfig for all registered modules
 */
export function generateAllExplicitRoutes(): RouteConfig[] {
  const { moduleRegistry } = require("@/shared/config/module-registry")
  const allRoutes: RouteConfig[] = []
  
  moduleRegistry.getAll().forEach((config: ModuleConfig) => {
    if (config.routePath) {
      const routes = generateModuleRoutes(config)
      allRoutes.push(...routes)
    }
  })
  
  return allRoutes
}

