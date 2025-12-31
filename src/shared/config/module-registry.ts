/**
 * Module Registry
 * 
 * Centralized registry for all module configurations
 * Auto-registers breadcrumb labels and provides utilities
 */

import { ModuleConfig } from "@/shared/types/module-config"
import { nhanSuConfig } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/config"
import { nguoiThanConfig } from "@/features/he-thong/nhan-su/nguoi-than/config"
import { keHoach168Config } from "@/features/cong-viec/tong-quan/ke-hoach-168/config"
import { viecHangNgayConfig } from "@/features/cong-viec/tong-quan/viec-hang-ngay/config"
import { danhMucCauHoiConfig } from "@/features/cong-viec/cau-hoi-hang-ngay/danh-muc-cau-hoi/config"
import { lichDangConfig } from "@/features/cong-viec/cau-hoi-hang-ngay/lich-dang/config"
import { loaiTaiLieuConfig } from "@/features/cong-viec/tai-lieu/loai-tai-lieu/config"
import { danhMucTaiLieuConfig } from "@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/config"
import { phanHoiKhachHangConfig } from "@/features/marketing/ky-thuat-cskh/phan-hoi-khach-hang/config"
import { loaiPhieuConfig } from "@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-phieu/config"
import { hangMucConfig } from "@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/hang-muc/config"
import { loaiDoanhThuConfig } from "@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-doanh-thu/config"

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
moduleRegistry.register(nguoiThanConfig)
moduleRegistry.register(keHoach168Config)
moduleRegistry.register(viecHangNgayConfig)
moduleRegistry.register(danhMucCauHoiConfig)
moduleRegistry.register(lichDangConfig)
moduleRegistry.register(loaiTaiLieuConfig)
moduleRegistry.register(danhMucTaiLieuConfig)
moduleRegistry.register(phanHoiKhachHangConfig)
moduleRegistry.register(loaiPhieuConfig)
moduleRegistry.register(hangMucConfig)
moduleRegistry.register(loaiDoanhThuConfig)

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

