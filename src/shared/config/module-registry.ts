/**
 * Module Registry
 * 
 * Centralized registry for all module configurations
 * Auto-registers breadcrumb labels and provides utilities
 */

import { ModuleConfig } from "@/shared/types/module-config"
import { nhanSuConfig } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/config"

/**
 * Registry class for managing module configurations
 */
class ModuleRegistry {
  private modules: Map<string, ModuleConfig> = new Map()

  /**
   * Register a module configuration
   */
  register(config: ModuleConfig): void {
    this.modules.set(config.moduleName, config)
  }

  /**
   * Get module config by module name
   */
  get(moduleName: string): ModuleConfig | undefined {
    return this.modules.get(moduleName)
  }

  /**
   * Get module config by route path
   */
  getByRoutePath(routePath: string): ModuleConfig | undefined {
    return Array.from(this.modules.values()).find(
      config => config.routePath === routePath
    )
  }

  /**
   * Get module config by route pattern
   */
  getByRoutePattern(routePattern: string): ModuleConfig | undefined {
    return Array.from(this.modules.values()).find(
      config => config.routePattern === routePattern
    )
  }

  /**
   * Get all registered modules
   */
  getAll(): ModuleConfig[] {
    return Array.from(this.modules.values())
  }

  /**
   * Get all route patterns
   */
  getAllRoutePatterns(): string[] {
    return this.getAll()
      .filter(config => config.routePattern)
      .map(config => config.routePattern!)
  }

  /**
   * Get breadcrumb label for a route path
   */
  getBreadcrumbLabel(routePath: string): string | undefined {
    const config = this.getByRoutePath(routePath)
    return config?.breadcrumb?.label || config?.moduleTitle
  }

  /**
   * Get parent label for a route path
   */
  getParentLabel(routePath: string): string | undefined {
    const config = this.getByRoutePath(routePath)
    return config?.breadcrumb?.parentLabel
  }

  /**
   * Check if a segment should be skipped in breadcrumb
   */
  shouldSkipSegment(segment: string, routePath: string): boolean {
    const config = this.getByRoutePath(routePath)
    return config?.breadcrumb?.skipSegments?.includes(segment) ?? false
  }
}

// Singleton instance
export const moduleRegistry = new ModuleRegistry()

// Register all modules
moduleRegistry.register(nhanSuConfig)

// Export helper functions
export function getModuleConfig(moduleName: string): ModuleConfig | undefined {
  return moduleRegistry.get(moduleName)
}

export function getModuleByRoutePath(routePath: string): ModuleConfig | undefined {
  return moduleRegistry.getByRoutePath(routePath)
}

export function getAllModules(): ModuleConfig[] {
  return moduleRegistry.getAll()
}

