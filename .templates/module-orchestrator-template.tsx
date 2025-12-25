/**
 * Module Orchestrator Template
 * 
 * Template này sử dụng orchestrator pattern với useModuleNavigation
 * để quản lý routing và state cho module, thay vì tạo các file page riêng.
 * 
 * Cấu trúc thư mục:
 * your-module/
 * ├── index.tsx (orchestrator - file này)
 * ├── config.tsx
 * ├── schema.ts
 * ├── components/
 * │   ├── your-module-list-view.tsx
 * │   ├── your-module-form-view.tsx
 * │   └── your-module-detail-view.tsx
 * ├── hooks/
 * │   ├── use-your-module.ts
 * │   └── use-your-module-mutations.ts
 * ├── services/
 * │   └── your-module-service.ts
 * └── types/
 *     └── your-module-types.ts
 */

"use client"

import { YourModuleListView } from "./components/your-module-list-view"
import { YourModuleFormView } from "./components/your-module-form-view"
import { YourModuleDetailView } from "./components/your-module-detail-view"
import { useModuleNavigation } from "@/shared/hooks/use-module-navigation"
import { yourModuleConfig } from "./config"

/**
 * YourModule Module - Orchestrator Component
 * 
 * Sử dụng useModuleNavigation để quản lý routing và state
 * Render các view components dựa trên URL path:
 * - /basePath -> ListView
 * - /basePath/moi -> FormView (create mode)
 * - /basePath/:id -> DetailView
 * - /basePath/:id/sua -> FormView (edit mode)
 */
export default function YourModuleModule() {
  const {
    isNew,
    isEdit,
    isDetail,
    handleAddNew,
    handleEdit,
    handleView,
    handleComplete,
    handleCancel,
    navigateToList,
    currentId,
  } = useModuleNavigation({
    basePath: yourModuleConfig.routePath,
  })

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {isNew || isEdit ? (
        <YourModuleFormView
          id={isEdit ? currentId || undefined : undefined}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      ) : isDetail && currentId ? (
        <YourModuleDetailView
          id={currentId}
          onEdit={() => handleEdit(currentId, 'detail')}
          onBack={navigateToList}
        />
      ) : (
        <YourModuleListView
          onEdit={(id) => handleEdit(id, 'list')}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      )}
    </div>
  )
}

// Re-export hooks, components, config, and types for convenience
export * from './hooks'
export * from './config'
export * from './components'
export * from './types'

