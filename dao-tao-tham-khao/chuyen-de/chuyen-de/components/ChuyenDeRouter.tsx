/**
 * ChuyenDeRouter Component
 * 
 * Router component for ChuyenDe sub-module
 * Handles routing between ListView, DetailView, and FormView
 */

import AccessDenied from '@components/ui/AccessDenied';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import LoadingSpinner from '@components/ui/feedback/LoadingSpinner';
import ConfirmDialog from '@components/ui/overlay/ConfirmDialog';
import Modal from '@components/ui/overlay/Modal';
import { useCauHoi, useChuyenDe, useChuyenDeNhom } from '@lib/hooks/queries/useTraining';
import { type CauHoi, type ChuyenDe, type ChuyenDeRouterProps } from '@src/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useCauHoiHandlers } from '../../cau-hoi/hooks/useCauHoiHandlers';
import { useChuyenDePermissionGuards } from '../../utils/chuyenDePermissions';
import { useChuyenDeData } from '../hooks/useChuyenDeData';
import { useChuyenDeHandlers } from '../hooks/useChuyenDeHandlers';
import { useChuyenDeState } from '../hooks/useChuyenDeState';

// Lazy load components
const ChuyenDeListView = React.lazy(() => import('./ChuyenDeListView'));
const ChuyenDeDetailView = React.lazy(() => import('./ChuyenDeDetailView'));
const ChuyenDeFormView = React.lazy(() => import('./ChuyenDeFormView'));

const ChuyenDeRouter: React.FC<ChuyenDeRouterProps> = ({
  onBack,
  onViewQuestionDetails,
  onAddQuestion,
  onViewChange,
  initialGroupId,
  navigateToId,
}) => {
  const state = useChuyenDeState();
  
  // Get permission guards for chuyen de
  const guards = useChuyenDePermissionGuards();

  // Auto-open form with initial groupId when provided (from InlineListTable)
  React.useEffect(() => {
    if (initialGroupId !== null && initialGroupId !== undefined && state.view === 'list') {
      state.handleAdd();
      state.setItemToEdit({ nhom_id: initialGroupId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGroupId]); // Only run when initialGroupId changes

  // Fetch data using TanStack Query directly
  const data = useChuyenDeData();
  
  // Handle navigation from breadcrumb
  useEffect(() => {
    if (navigateToId !== null && navigateToId !== undefined) {
      const topic = data.topicList.find(t => t.id === navigateToId);
      if (topic) {
        state.handleViewDetails(topic);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateToId, data.topicList]); // Depend on navigateToId and data.topicList
  
  // Get loading states from queries
  const { isLoading: isLoadingChuyenDe } = useChuyenDe();
  const { isLoading: isLoadingChuyenDeNhom } = useChuyenDeNhom();
  const { isLoading: isLoadingCauHoi } = useCauHoi();
  const isLoading = isLoadingChuyenDe || isLoadingChuyenDeNhom || isLoadingCauHoi;

  // Handlers
  const handlers = useChuyenDeHandlers();
  const cauHoiHandlers = useCauHoiHandlers();

  // Get selected topic
  const selectedTopic = useMemo(() => {
    if (!state.selectedId) return null;
    return data.topicList.find(t => t.id === state.selectedId) || null;
  }, [state.selectedId, data.topicList]);

  // Get questions for selected topic
  const questionsForSelectedTopic = useMemo(() => {
    if (!selectedTopic) return [];
    return data.questionList.filter(q => q.chuyen_de_id === selectedTopic.id);
  }, [selectedTopic, data.questionList]);

  // Get group name for selected topic
  const groupName = useMemo(() => {
    if (!selectedTopic) return 'N/A';
    return data.groupMap.get(selectedTopic.nhom_id) || 'N/A';
  }, [selectedTopic, data.groupMap]);

  // Get creator name
  const creatorName = useMemo(() => {
    if (!selectedTopic) return 'N/A';
    return data.employeeMap.get(selectedTopic.nguoi_tao_id) || 'N/A';
  }, [selectedTopic, data.employeeMap]);

  // Wrapper handlers with permission checks
  const handleAdd = useCallback(() => {
    if (!guards.canAdd()) return;
    state.handleAdd();
  }, [guards, state]);

  const handleEdit = useCallback((item: ChuyenDe) => {
    if (!guards.canEdit()) return;
    state.handleEdit(item);
  }, [guards, state]);

  const handleDelete = useCallback((item: ChuyenDe | ChuyenDe[]) => {
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

  // Question handlers callbacks - must be at top level (Rules of Hooks)
  const handleSaveQuestion = useCallback(async (item: Partial<CauHoi>) => {
    await cauHoiHandlers.handleSave(item);
  }, [cauHoiHandlers]);

  const handleDeleteQuestion = useCallback(async (question: CauHoi) => {
    await cauHoiHandlers.handleDelete([question]);
  }, [cauHoiHandlers]);

  // Notify parent router about view changes for breadcrumb management
  useEffect(() => {
    if (!onViewChange) return;

    const currentView = (() => {
      // Full page form view
      if (state.view === 'form') {
        return {
          type: 'form' as const,
          section: 'Chuyên đề',
          selectedItems: state.itemToEdit?.id && selectedTopic
            ? [{ id: selectedTopic.id, name: selectedTopic.ten_chuyen_de, type: 'chuyen_de' }]
            : undefined,
          formMode: (state.itemToEdit?.id ? 'edit' : 'add') as 'add' | 'edit',
        };
      }

      if (state.view === 'detail' && selectedTopic) {
        return {
          type: 'detail' as const,
          section: 'Chuyên đề',
          selectedItems: [{ id: selectedTopic.id, name: selectedTopic.ten_chuyen_de, type: 'chuyen_de' }],
        };
      }

      return { type: 'list' as const, section: 'Chuyên đề' };
    })();

    onViewChange(currentView);
  }, [state.view, state.selectedId, state.itemToEdit?.id, selectedTopic, onViewChange]);

  return (
    <ErrorBoundary>
      {/* Check view permission */}
      {!guards.canView() && (
        <AccessDenied 
          onBack={onBack} 
          title="Từ chối truy cập"
          message="Bạn không có quyền xem chuyên đề. Vui lòng liên hệ quản trị viên."
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
          <ChuyenDeListView
            items={data.enhancedTopics}
            groupList={data.groupList}
            employeeMap={data.employeeMap}
                onAdd={guards.canAdd() ? handleAdd : undefined}
                onEdit={guards.canEdit() ? handleEdit : undefined}
                onDelete={guards.canDelete() ? handleDelete : undefined}
            onView={state.handleViewDetails}
            onBack={onBack}
          />
        </React.Suspense>
      )}

      {state.view === 'detail' && selectedTopic && (
        <React.Suspense fallback={<div className="p-4">Đang tải chi tiết...</div>}>
          <ChuyenDeDetailView
            item={selectedTopic}
            groupName={groupName}
            creatorName={creatorName}
            questions={questionsForSelectedTopic}
            topicList={data.topicList}
            groupList={data.groupList}
            employeeMap={data.employeeMap}
            onBack={state.handleBackToList}
                onEdit={guards.canEdit() ? () => { if (selectedTopic) handleEdit(selectedTopic); } : undefined}
                onDelete={guards.canDelete() ? () => { handleDelete(selectedTopic); } : undefined}
            onSaveQuestion={handleSaveQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onViewQuestionDetails={onViewQuestionDetails}
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
                      message="Bạn không có quyền sửa chuyên đề. Vui lòng liên hệ quản trị viên."
                    />
                  );
                }
                if (!isEditing && !guards.canAdd()) {
                  return (
                    <AccessDenied 
                      onBack={state.handleCloseForm} 
                      title="Từ chối truy cập"
                      message="Bạn không có quyền thêm chuyên đề. Vui lòng liên hệ quản trị viên."
                    />
                  );
                }
                return (
        <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
          <ChuyenDeFormView
            onBack={state.handleCloseForm}
            onSave={async (item) => {
              const result = await handlers.handleSave(item);
              state.handleCloseForm();
              return result;
            }}
            itemToEdit={state.itemToEdit}
            groupList={data.groupList}
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
          title={state.itemToEditInModal?.id ? 'Sửa chuyên đề' : 'Thêm chuyên đề'}
          disableClickOutside={true}
        >
          <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
            <ChuyenDeFormView
              onBack={state.handleCloseFormModal}
              onSave={async (item) => {
                const result = await handlers.handleSave(item);
                state.handleCloseFormModal();
                return result;
              }}
            itemToEdit={state.itemToEditInModal}
            groupList={data.groupList}
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
              ? `Bạn có chắc muốn xóa ${state.deleteModal.items.length} chuyên đề? Thao tác này sẽ xóa tất cả câu hỏi thuộc các chuyên đề này.`
              : `Bạn có chắc muốn xóa chuyên đề "${state.deleteModal.items[0].ten_chuyen_de}"? Thao tác này sẽ xóa tất cả câu hỏi thuộc chuyên đề này.`
          }
          variant="danger"
        />
      )}
    </ErrorBoundary>
  );
};

export default ChuyenDeRouter;

