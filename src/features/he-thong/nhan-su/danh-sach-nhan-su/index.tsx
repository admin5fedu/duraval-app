/**
 * Danh Sách Nhân Sự Module
 * 
 * @deprecated This orchestrator component is deprecated.
 * Module now uses explicit routes in routes/ folder.
 * See: src/features/he-thong/nhan-su/danh-sach-nhan-su/routes/
 * 
 * This file is kept for backward compatibility but should not be used.
 * Use explicit route components instead.
 */

"use client"

import { NhanSuListView } from "./components/nhan-su-list-view"
import { NhanSuFormView } from "./components/nhan-su-form-view"
import { NhanSuDetailView } from "./components/nhan-su-detail-view"
import { useModuleNavigation } from "@/shared/hooks/use-module-navigation"
import { nhanSuConfig } from "./config"

/**
 * @deprecated Use explicit route components in routes/ folder instead
 */
export default function DanhSachNhanSuModule() {
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
    basePath: nhanSuConfig.routePath,
  })

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {isNew || isEdit ? (
        <NhanSuFormView
          id={isEdit ? currentId || undefined : undefined}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      ) : isDetail && currentId ? (
        <NhanSuDetailView
          id={currentId}
          onEdit={() => handleEdit(currentId, 'detail')}
          onBack={navigateToList}
        />
      ) : (
        <NhanSuListView
          onEdit={(id) => handleEdit(id, 'list')}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      )}
    </div>
  )
}

