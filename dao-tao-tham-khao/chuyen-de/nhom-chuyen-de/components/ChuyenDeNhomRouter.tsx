/**
 * ChuyenDeNhomRouter Component
 * 
 * Router component for ChuyenDeNhom sub-module
 * Handles routing between ListView, DetailView, and FormView
 */

import AccessDenied from '@components/ui/AccessDenied';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import LoadingSpinner from '@components/ui/feedback/LoadingSpinner';
import ConfirmDialog from '@components/ui/overlay/ConfirmDialog';
import Modal from '@components/ui/overlay/Modal';
import { useCauHoi, useChuyenDe, useChuyenDeNhom } from '@lib/hooks/queries/useTraining';
import { type ChuyenDe, type ChuyenDeNhom, type ChuyenDeNhomRouterProps } from '@src/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useChuyenDeHandlers } from '../../chuyen-de/hooks/useChuyenDeHandlers';
import { useChuyenDePermissionGuards } from '../../utils/chuyenDePermissions';
import { useChuyenDeNhomData } from '../hooks/useChuyenDeNhomData';
import { useChuyenDeNhomHandlers } from '../hooks/useChuyenDeNhomHandlers';
import { useChuyenDeNhomState } from '../hooks/useChuyenDeNhomState';

// Lazy load components
const ChuyenDeNhomListView = React.lazy(() => import('./ChuyenDeNhomListView'));
const ChuyenDeNhomDetailView = React.lazy(() => import('./ChuyenDeNhomDetailView'));
const ChuyenDeNhomFormView = React.lazy(() => import('./ChuyenDeNhomFormView'));

const ChuyenDeNhomRouter: React.FC<ChuyenDeNhomRouterProps> = ({
  onBack,
  onViewTopicDetails,
  onAddTopic,
  onViewChange,
  navigateToId,
}) => {
  const state = useChuyenDeNhomState();
  
  // Get permission guards for nhom chuyen de
  const guards = useChuyenDePermissionGuards();

  // Fetch data using TanStack Query directly
  const data = useChuyenDeNhomData();
  
  // Handle navigation from breadcrumb
  useEffect(() => {
    if (navigateToId !== null && navigateToId !== undefined) {
      const group = data.groupList.find(g => g.id === navigateToId);
      if (group) {
        state.handleViewDetails(group);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateToId, data.groupList]); // Depend on navigateToId and data.groupList
  
  // Get loading states from queries
  const { isLoading: isLoadingChuyenDeNhom } = useChuyenDeNhom();
  const { isLoading: isLoadingChuyenDe } = useChuyenDe();
  const { isLoading: isLoadingCauHoi } = useCauHoi();
  const isLoading = isLoadingChuyenDeNhom || isLoadingChuyenDe || isLoadingCauHoi;

  // Handlers
  const handlers = useChuyenDeNhomHandlers();
  const chuyenDeHandlers = useChuyenDeHandlers();

  // Get selected group
  const selectedGroup = useMemo(() => {
    if (!state.selectedId) return null;
    return data.groupList.find(g => g.id === state.selectedId) || null;
  }, [state.selectedId, data.groupList]);

  // Get topics for selected group
  const topicsForSelectedGroup = useMemo(() => {
    if (!selectedGroup) return [];
    return data.topicList.filter(t => t.nhom_id === selectedGroup.id);
  }, [selectedGroup, data.topicList]);

  // Wrapper handlers with permission checks
  const handleAdd = useCallback(() => {
    if (!guards.canAdd()) return;
    state.handleAdd();
  }, [guards, state]);

  const handleEdit = useCallback((item: ChuyenDeNhom) => {
    if (!guards.canEdit()) return;
    state.handleEdit(item);
  }, [guards, state]);

  const handleDelete = useCallback((item: ChuyenDeNhom | ChuyenDeNhom[]) => {
    if (!guards.canDelete()) return;
    state.handleDelete(item);
  }, [guards, state]);

  // Delete confirmation
  const confirmDelete = useCallback(async () => {
    if (state.deleteModal) {
      await handlers.handleDelete(state.deleteModal.items);
      if (state.view === 'detail' && state.selectedId) {
        const deletedIds = new Set(state.deleteModal.items.map(item => item.id));
        if (deletedIds.has(state.selectedId)) {
          state.handleBackToList();
        }
      }
      state.setDeleteModal(null);
    }
  }, [state, handlers]);

  // Topic handlers callbacks - must be at top level (Rules of Hooks)
  const handleSaveTopic = useCallback(async (item: Partial<ChuyenDe>) => {
    const topicData = {
      ...item,
      nhom_id: item.nhom_id || selectedGroup?.id || 0,
    };
    await chuyenDeHandlers.handleSave(topicData);
  }, [chuyenDeHandlers, selectedGroup]);

  const handleDeleteTopic = useCallback(async (topic: ChuyenDe) => {
    await chuyenDeHandlers.handleDelete([topic]);
  }, [chuyenDeHandlers]);

  // Notify parent router about view changes for breadcrumb management
  useEffect(() => {
    if (!onViewChange) return;

    const currentView = (() => {
      // Full page form view
      if (state.view === 'form') {
        return {
          type: 'form' as const,
          section: 'Nhóm chuyên đề',
          selectedItems: state.itemToEdit?.id && selectedGroup
            ? [{ id: selectedGroup.id, name: selectedGroup.ten_nhom, type: 'chuyen_de_nhom' }]
            : undefined,
          formMode: (state.itemToEdit?.id ? 'edit' : 'add') as 'add' | 'edit',
        };
      }

      if (state.view === 'detail' && selectedGroup) {
        return {
          type: 'detail' as const,
          section: 'Nhóm chuyên đề',
          selectedItems: [{ id: selectedGroup.id, name: selectedGroup.ten_nhom, type: 'chuyen_de_nhom' }],
        };
      }

      return { type: 'list' as const, section: 'Nhóm chuyên đề' };
    })();

    onViewChange(currentView);
  }, [state.view, state.selectedId, state.itemToEdit?.id, selectedGroup, onViewChange]);

  return (
    <ErrorBoundary>
      {/* Check view permission */}
      {!guards.canView() && (
        <AccessDenied 
          onBack={onBack} 
          title="Từ chối truy cập"
          message="Bạn không có quyền xem nhóm chuyên đề. Vui lòng liên hệ quản trị viên."
        />
      )}

      {guards.canView() && (
        <>
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" message="Đang tải dữ liệu..." />
        </div>
      )}

      {!isLoading && state.view === 'list' && (
        <React.Suspense fallback={<div className="p-4">Đang tải danh sách...</div>}>
          <ChuyenDeNhomListView
            items={data.groupList}
            employeeMap={data.employeeMap}
            stats={data.groupStats}
                onAdd={guards.canAdd() ? handleAdd : undefined}
                onEdit={guards.canEdit() ? handleEdit : undefined}
                onDelete={guards.canDelete() ? handleDelete : undefined}
            onView={state.handleViewDetails}
            onBack={onBack}
          />
        </React.Suspense>
      )}

      {state.view === 'detail' && selectedGroup && (
        <React.Suspense fallback={<div className="p-4">Đang tải chi tiết...</div>}>
          <ChuyenDeNhomDetailView
            item={selectedGroup}
            topics={topicsForSelectedGroup}
            employeeMap={data.employeeMap}
            groupList={data.groupList}
            onBack={state.handleBackToList}
                onEditGroup={guards.canEdit() ? () => { if (selectedGroup) handleEdit(selectedGroup); } : undefined}
                onDeleteGroup={guards.canDelete() ? () => { handleDelete(selectedGroup); } : undefined}
            onSaveTopic={handleSaveTopic}
            onDeleteTopic={handleDeleteTopic}
            onViewTopicDetails={onViewTopicDetails}
          />
        </React.Suspense>
      )}

      {/* Full Page Form View */}
      {state.view === 'form' && (
            <>
              {/* Check add/edit permission for form view */}
              {(() => {
                const isEditing = !!state.itemToEdit?.id;
                if (isEditing && !guards.canEdit()) {
                  return (
                    <AccessDenied 
                      onBack={state.handleCloseForm} 
                      title="Từ chối truy cập"
                      message="Bạn không có quyền sửa nhóm chuyên đề. Vui lòng liên hệ quản trị viên."
                    />
                  );
                }
                if (!isEditing && !guards.canAdd()) {
                  return (
                    <AccessDenied 
                      onBack={state.handleCloseForm} 
                      title="Từ chối truy cập"
                      message="Bạn không có quyền thêm nhóm chuyên đề. Vui lòng liên hệ quản trị viên."
                    />
                  );
                }
                return (
        <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
          <ChuyenDeNhomFormView
            onBack={state.handleCloseForm}
            onSave={async (item) => {
              const result = await handlers.handleSave(item);
              state.handleCloseForm();
              return result;
            }}
            itemToEdit={state.itemToEdit}
          />
        </React.Suspense>
                );
              })()}
            </>
          )}
        </>
      )}

      {/* Form Modal (for InlineListTable - not used in this router, but kept for consistency) */}
      {state.isFormModalOpen && (
        <Modal
          isOpen={true}
          onClose={state.handleCloseFormModal}
          title={state.itemToEditInModal?.id ? 'Sửa nhóm chuyên đề' : 'Thêm nhóm chuyên đề'}
          disableClickOutside={true}
        >
          <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
            <ChuyenDeNhomFormView
              onBack={state.handleCloseFormModal}
              onSave={async (item) => {
                const result = await handlers.handleSave(item);
                state.handleCloseFormModal();
                return result;
              }}
              itemToEdit={state.itemToEditInModal}
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
              ? `Bạn có chắc muốn xóa ${state.deleteModal.items.length} nhóm chuyên đề? Hành động này sẽ xóa cả các chuyên đề và câu hỏi bên trong.`
              : `Bạn có chắc muốn xóa nhóm "${state.deleteModal.items[0].ten_nhom}"? Hành động này sẽ xóa cả các chuyên đề và câu hỏi bên trong.`
          }
          variant="danger"
        />
      )}
    </ErrorBoundary>
  );
};

export default ChuyenDeNhomRouter;

