/**
 * CauHoiRouter Component
 * 
 * Router component for CauHoi sub-module
 * Handles routing between ListView, DetailView, and FormView
 */

import AccessDenied from '@components/ui/AccessDenied';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import LoadingSpinner from '@components/ui/feedback/LoadingSpinner';
import ConfirmDialog from '@components/ui/overlay/ConfirmDialog';
import Modal from '@components/ui/overlay/Modal';
import { useCauHoi, useChuyenDe, useChuyenDeNhom } from '@lib/hooks/queries/useTraining';
import { type CauHoi, type CauHoiRouterProps } from '@src/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useCauHoiPermissionGuards } from '../../utils/chuyenDePermissions';
import { useCauHoiData } from '../hooks/useCauHoiData';
import { useCauHoiHandlers } from '../hooks/useCauHoiHandlers';
import { useCauHoiState } from '../hooks/useCauHoiState';

// Lazy load components
const CauHoiListView = React.lazy(() => import('./CauHoiListView'));
const CauHoiDetailView = React.lazy(() => import('./CauHoiDetailView'));
const CauHoiFormView = React.lazy(() => import('./CauHoiFormView'));

const CauHoiRouter: React.FC<CauHoiRouterProps> = ({
  onBack,
  onViewChange,
  initialTopicId,
  navigateToId,
}) => {
  const state = useCauHoiState();
  
  // Get permission guards for cau hoi
  const guards = useCauHoiPermissionGuards();

  // Fetch data using TanStack Query directly
  const data = useCauHoiData();
  
  // Handle navigation from breadcrumb
  React.useEffect(() => {
    if (navigateToId !== null && navigateToId !== undefined) {
      const question = data.questionList.find(q => q.id === navigateToId);
      if (question) {
        state.handleViewDetails(question);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateToId, data.questionList]); // Depend on navigateToId and data.questionList

  // Auto-open form with initial topicId when provided (from InlineListTable)
  React.useEffect(() => {
    if (initialTopicId !== null && initialTopicId !== undefined && state.view === 'list') {
      state.handleAdd();
      state.setItemToEdit({ chuyen_de_id: initialTopicId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopicId]); // Only run when initialTopicId changes
  
  // Fetch group list for form
  const { data: groupList = [], isLoading: isLoadingGroupList } = useChuyenDeNhom();
  
  // Get loading states from queries
  const { isLoading: isLoadingCauHoi } = useCauHoi();
  const { isLoading: isLoadingChuyenDe } = useChuyenDe();
  const isLoading = isLoadingCauHoi || isLoadingChuyenDe || isLoadingGroupList;

  // Handlers
  const handlers = useCauHoiHandlers();

  // Get selected question
  const selectedQuestion = useMemo(() => {
    if (!state.selectedId) return null;
    return data.questionList.find(q => q.id === state.selectedId) || null;
  }, [state.selectedId, data.questionList]);

  // Get topic name for selected question
  const topicName = useMemo(() => {
    if (!selectedQuestion) return 'N/A';
    return data.topicMap.get(selectedQuestion.chuyen_de_id) || 'N/A';
  }, [selectedQuestion, data.topicMap]);

  // Get creator name
  const creatorName = useMemo(() => {
    if (!selectedQuestion) return 'N/A';
    return data.employeeMap.get(selectedQuestion.nguoi_tao_id) || 'N/A';
  }, [selectedQuestion, data.employeeMap]);

  // Wrapper handlers with permission checks
  const handleAdd = useCallback(() => {
    if (!guards.canAdd()) return;
    state.handleAdd();
  }, [guards, state]);

  const handleEdit = useCallback((item: CauHoi) => {
    if (!guards.canEdit()) return;
    state.handleEdit(item);
  }, [guards, state]);

  const handleDelete = useCallback((item: CauHoi | CauHoi[]) => {
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

  // Notify parent router about view changes for breadcrumb management
  useEffect(() => {
    if (!onViewChange) return;

    const currentView = (() => {
      // Full page form view
      if (state.view === 'form') {
        return {
          type: 'form' as const,
          section: 'Câu hỏi',
          selectedItems: state.itemToEdit?.id && selectedQuestion
            ? [{ id: selectedQuestion.id, name: selectedQuestion.cau_hoi.substring(0, 50) + '...', type: 'cau_hoi' }]
            : undefined,
          formMode: (state.itemToEdit?.id ? 'edit' : 'add') as 'add' | 'edit',
        };
      }

      if (state.view === 'detail' && selectedQuestion) {
        return {
          type: 'detail' as const,
          section: 'Câu hỏi',
          selectedItems: [{ id: selectedQuestion.id, name: selectedQuestion.cau_hoi.substring(0, 50) + '...', type: 'cau_hoi' }],
        };
      }

      return { type: 'list' as const, section: 'Câu hỏi' };
    })();

    onViewChange(currentView);
  }, [state.view, state.selectedId, state.itemToEdit?.id, selectedQuestion, onViewChange]);

  return (
    <ErrorBoundary>
      {/* Check view permission */}
      {!guards.canView() && (
        <AccessDenied 
          onBack={onBack} 
          title="Từ chối truy cập"
          message="Bạn không có quyền xem câu hỏi. Vui lòng liên hệ quản trị viên."
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
          <CauHoiListView
            items={data.enhancedQuestions}
            topicList={data.topicList}
            employeeMap={data.employeeMap}
                onAdd={guards.canAdd() ? handleAdd : undefined}
                onEdit={guards.canEdit() ? handleEdit : undefined}
                onDelete={guards.canDelete() ? handleDelete : undefined}
            onView={state.handleViewDetails}
            onBack={onBack}
          />
        </React.Suspense>
      )}

      {state.view === 'detail' && selectedQuestion && (
        <React.Suspense fallback={<div className="p-4">Đang tải chi tiết...</div>}>
          <CauHoiDetailView
            item={selectedQuestion}
            topicName={topicName}
            creatorName={creatorName}
            onBack={state.handleBackToList}
                onEdit={guards.canEdit() ? () => { if (selectedQuestion) handleEdit(selectedQuestion); } : undefined}
                onDelete={guards.canDelete() ? () => { handleDelete(selectedQuestion); } : undefined}
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
                      message="Bạn không có quyền sửa câu hỏi. Vui lòng liên hệ quản trị viên."
                    />
                  );
                }
                if (!isEditing && !guards.canAdd()) {
                  return (
                    <AccessDenied 
                      onBack={state.handleCloseForm} 
                      title="Từ chối truy cập"
                      message="Bạn không có quyền thêm câu hỏi. Vui lòng liên hệ quản trị viên."
                    />
                  );
                }
                return (
        <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
          <CauHoiFormView
            onBack={state.handleCloseForm}
            onSave={async (item) => {
              const result = await handlers.handleSave(item);
              state.handleCloseForm();
              return result;
            }}
            itemToEdit={state.itemToEdit}
            topicList={data.topicList}
            groupList={groupList}
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
          title={state.itemToEditInModal?.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
          disableClickOutside={true}
        >
          <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
            <CauHoiFormView
              onBack={state.handleCloseFormModal}
              onSave={async (item) => {
                const result = await handlers.handleSave(item);
                state.handleCloseFormModal();
                return result;
              }}
              itemToEdit={state.itemToEditInModal}
              topicList={data.topicList}
              groupList={groupList}
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
              ? `Bạn có chắc muốn xóa ${state.deleteModal.items.length} câu hỏi?`
              : 'Bạn có chắc muốn xóa câu hỏi này?'
          }
          variant="danger"
        />
      )}
    </ErrorBoundary>
  );
};

export default CauHoiRouter;

