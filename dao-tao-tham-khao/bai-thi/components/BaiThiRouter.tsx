/**
 * BaiThiRouter Component
 * 
 * Router component for BaiThi module
 * Handles routing between ListView, DetailView, and FormView
 */

import ErrorBoundary from '@components/ui/ErrorBoundary';
import ConfirmDialog from '@components/ui/overlay/ConfirmDialog';
import Modal from '@components/ui/overlay/Modal';
import { useAuth } from '@lib/contexts/AuthContext';
import { type BaiThiRouterProps, type DanhGia } from '@src/types';
import React, { useCallback, useEffect } from 'react';
import { useBaiThiBreadcrumb } from '../hooks/useBaiThiBreadcrumb';
import { useBaiThiData } from '../hooks/useBaiThiData';
import { useBaiThiHandlers } from '../hooks/useBaiThiHandlers';
import { useBaiThiState } from '../hooks/useBaiThiState';
import { useBaiThiPermissionGuards } from '../utils/baiThiPermissions';
// Lazy load components
const BaiThiListView = React.lazy(() => import('./BaiThiListView'));
const BaiThiDetailView = React.lazy(() => import('./BaiThiDetailView'));
const BaiThiFormView = React.lazy(() => import('./BaiThiFormView'));

const BaiThiRouter: React.FC<BaiThiRouterProps> = ({
  onBack,
  goBackToMenu,
  goToHomeWithModule,
  goToHome,
  initialFilter: propInitialFilter,
  onFilterApplied,
}) => {
  const state = useBaiThiState();
  const { currentUser, enhancedEmployees, chucVu, capChucDanh } = useAuth();
  
  // Get permission guards for bai thi module
  const guards = useBaiThiPermissionGuards();
  
  // Apply initial filter from props to state (when navigating from other modules)
  useEffect(() => {
    if (propInitialFilter) {
      state.setInitialFilter(propInitialFilter);
      // Notify parent that filter has been applied (so it can be cleared)
      onFilterApplied?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propInitialFilter]); // Only depend on propInitialFilter to avoid loops

  // Fetch data using TanStack Query directly
  const data = useBaiThiData({
    activeTab: state.activeTab,
    filters: state.initialFilter || {},
  });

  // Handlers using TanStack Query mutations directly
  const handlers = useBaiThiHandlers();

  // Delete confirmation
  const confirmDelete = useCallback(async () => {
    if (state.deleteModal) {
      await handlers.handleDelete(state.deleteModal.items);
      if (state.view === 'detail') {
        const deletedIds = new Set(state.deleteModal.items.map(item => item.id));
        if (state.selectedBaiThi && deletedIds.has(state.selectedBaiThi.id)) {
          state.handleBackToList();
        }
      }
      state.setDeleteModal(null);
    }
  }, [state, handlers]);

  // Save DanhGia handler
  const handleSaveDanhGia = useCallback(async (baiThiId: number, danhGia: DanhGia | null) => {
    const updated = await handlers.handleSaveDanhGia(baiThiId, danhGia);
    // Update selected item if it's the same
    if (updated && state.selectedBaiThi && state.selectedBaiThi.id === baiThiId) {
      state.setSelectedBaiThi(updated);
    }
  }, [handlers, state]);

  // Breadcrumb setup - ✨ Clean & Professional using custom hook
  useBaiThiBreadcrumb({
    view: state.view,
    activeTab: state.activeTab,
    isFormOpen: state.isFormOpen,
    itemToEdit: state.itemToEdit,
    selectedBaiThi: state.selectedBaiThi,
    employeeMap: data.employeeMap,
    baiThiLamList: data.baiThiLamList,
    goToHome,
    goToHomeWithModule,
    goBackToMenu,
    onBack,
    handleBackToList: state.handleBackToList,
    setActiveTab: state.setActiveTab,
    handleViewDetails: state.handleViewDetails,
  });

  return (
    <ErrorBoundary>
      {state.view === 'list' && (
        <React.Suspense fallback={<div className="p-4">Đang tải danh sách...</div>}>
          <BaiThiListView
            items={data.filteredItems}
            kyThiList={data.kyThiList}
            employeeMap={data.employeeMap}
            onAdd={state.handleAdd}
            onEdit={state.handleEdit}
            onDelete={state.handleDelete}
            onViewDetails={state.handleViewDetails}
            onBack={goToHomeWithModule || goBackToMenu || onBack}
            activeTab={state.activeTab}
            onTabChange={state.setActiveTab}
            initialFilter={state.initialFilter}
            clearInitialFilter={() => state.setInitialFilter(null)}
            myBaiThiCount={data.myBaiThiList.length}
            allBaiThiCount={data.baiThiLamList.length}
          />
        </React.Suspense>
      )}

      {state.view === 'detail' && state.selectedBaiThi && (
        <React.Suspense fallback={<div className="p-4">Đang tải chi tiết...</div>}>
          <BaiThiDetailView
            item={state.selectedBaiThi}
            onBack={() => {
              state.handleBackToList();
            }}
            onSaveDanhGia={handleSaveDanhGia}
            onDelete={state.handleDelete}
            employeeMap={data.employeeMap}
            kyThiMap={data.kyThiMap}
            questionList={data.questionList}
          />
        </React.Suspense>
      )}

      {/* Form Modal */}
      {state.isFormOpen && (
        <Modal
          isOpen={true}
          onClose={state.handleCloseForm}
          title={state.itemToEdit?.id ? 'Sửa bài thi' : 'Thêm bài thi'}
          disableClickOutside={true}
        >
          <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
            <BaiThiFormView
              onBack={state.handleCloseForm}
              onSave={async (item) => {
                await handlers.handleSave(item);
                state.handleCloseForm();
              }}
              itemToEdit={state.itemToEdit}
              kyThiList={data.kyThiList}
              enhancedEmployees={enhancedEmployees}
            />
          </React.Suspense>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {state.deleteModal && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => state.setDeleteModal(null)}
          onConfirm={confirmDelete}
          title="Xác nhận xóa"
          message={
            state.deleteModal.isBulk
              ? `Bạn có chắc muốn xóa ${state.deleteModal.items.length} bài thi?`
              : `Bạn có chắc muốn xóa bài thi này?`
          }
          variant="danger"
        />
      )}
    </ErrorBoundary>
  );
};

export default BaiThiRouter;

