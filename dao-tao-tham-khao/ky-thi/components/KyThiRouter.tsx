/**
 * KyThiRouter Component
 * 
 * Router component for KyThi module
 * Handles routing between ListView, DetailView, FormView, TestView, and ResultView
 */

import AccessDenied from '@components/ui/AccessDenied';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import LoadingSpinner from '@components/ui/feedback/LoadingSpinner';
import ConfirmDialog from '@components/ui/overlay/ConfirmDialog';
import Modal from '@components/ui/overlay/Modal';
import { useAuth } from '@lib/contexts/AuthContext';
import { useCauHoi } from '@lib/hooks/queries/useTraining';
import { ClockIcon } from '@src/assets/icons';
import { type BaiThiLam, type DanhGia, type KyThi, type KyThiRouterProps } from '@src/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useBaiThiHandlers } from '../../bai-thi/hooks/useBaiThiHandlers';
import { useKyThiBreadcrumb } from '../hooks/useKyThiBreadcrumb';
import { useKyThiData } from '../hooks/useKyThiData';
import { useKyThiHandlers } from '../hooks/useKyThiHandlers';
import { useKyThiState } from '../hooks/useKyThiState';
import { ANSWER_LABELS } from '../utils/kyThiHelpers';
import { useKyThiPermissionGuards } from '../utils/kyThiPermissions';
// Lazy load components
const KyThiListView = React.lazy(() => import('./KyThiListView'));
const KyThiDetailView = React.lazy(() => import('./KyThiDetailView'));
const KyThiFormView = React.lazy(() => import('./KyThiFormView'));
const BaiThiDetailView = React.lazy(() => import('../../bai-thi/components/BaiThiDetailView'));

const KyThiRouter: React.FC<KyThiRouterProps> = ({
  onBack,
  goBackToMenu,
  goToHomeWithModule,
  onViewMyTests,
  onViewBaiThiDetails,
  goToHome,
}) => {
  const state = useKyThiState();
  const { enhancedEmployees, donViToChuc, chucVu } = useAuth();
  
  // Get permission guards for ky-thi module
  const guards = useKyThiPermissionGuards();
  
  // Fetch data using TanStack Query directly
  const data = useKyThiData({
    activeTab: state.activeTab,
  });
  
  // Fetch question list for test functionality
  const { data: questionList = [] } = useCauHoi();

  // Create maps for BaiThiDetailView
  const employeeMap = useMemo(() => {
    return new Map(enhancedEmployees.map(e => [e.id, e.ho_ten]));
  }, [enhancedEmployees]);

  const kyThiMap = useMemo(() => {
    return new Map(data.kyThiList.map(k => [k.id, k.ten_ky_thi]));
  }, [data.kyThiList]);

  // Handlers
  const handlers = useKyThiHandlers({
    setSelectedKyThi: state.handleView,
    setShuffledQuestions: state.setShuffledQuestions,
    setCurrentTest: state.setCurrentTest,
    setUserAnswers: state.setUserAnswers,
    setCurrentQuestionIndex: state.setCurrentQuestionIndex,
    setTimeLeft: state.setTimeLeft,
    setIsTimeWarning: state.setIsTimeWarning,
    setView: state.setView,
    setFinalResult: state.setFinalResult,
    onViewBaiThiDetails,
  });

  // BaiThi handlers for nested detail view
  const baiThiHandlers = useBaiThiHandlers();

  // Wrapper handlers with permission checks
  const handleAdd = useCallback(() => {
    if (!guards.canAdd()) return;
    state.handleAdd();
  }, [guards, state]);

  const handleEdit = useCallback((item: KyThi) => {
    if (!guards.canEdit()) return;
    state.handleEdit(item);
  }, [guards, state]);

  const handleDelete = useCallback((item: KyThi | KyThi[]) => {
    if (!guards.canDelete()) return;
    state.handleDelete(item);
  }, [guards, state]);

  // Delete confirmation
  const confirmDelete = useCallback(async () => {
    if (state.deleteModal) {
      await handlers.handleDelete(state.deleteModal.items);
      if (state.view === 'detail') {
        const deletedIds = new Set(state.deleteModal.items.map(item => item.id));
        if (state.selectedKyThi && deletedIds.has(state.selectedKyThi.id)) {
          state.setView('list');
          state.handleBack();
        }
      }
      state.setDeleteModal(null);
    }
  }, [state, handlers]);

  // Test handlers
  const handleStartTest = useCallback(async (kyThi: KyThi) => {
    await handlers.handleStartTest(kyThi);
    // After handleStartTest completes, if result was created, Router will handle the view transition
    // The test view will be rendered based on state.currentTest
  }, [handlers]);

  const handleContinueTest = useCallback((baiThi: BaiThiLam) => {
    handlers.handleContinueTest(baiThi);
  }, [handlers]);

  const handleStartTimerAndTest = useCallback(async () => {
    if (state.currentTest) {
      await handlers.handleStartTimerAndTest(state.currentTest);
    }
  }, [state.currentTest, handlers]);

  const handleBackFromPendingTest = useCallback(() => {
    state.resetTestState();
    state.setView(state.selectedKyThi ? 'detail' : 'list');
  }, [state]);

  const handleAnswerSelect = useCallback((originalIndex: number | null) => {
    const newAnswers = [...state.userAnswers];
    newAnswers[state.currentQuestionIndex] = originalIndex;
    state.setUserAnswers(newAnswers);
  }, [state]);

  const ensureAllQuestionsAnswered = useCallback((actionLabel: string) => {
    if (!state.currentTest) return false;
    const firstUnanswered = state.userAnswers.findIndex(answer => answer === null);
    if (firstUnanswered !== -1) {
      // Toast sẽ được handle trong finalizeTest
      state.setCurrentQuestionIndex(firstUnanswered);
      return false;
    }
    return true;
  }, [state]);

  const finalizeTest = useCallback(async () => {
    if (!state.currentTest) return;
    await handlers.finalizeTest(
      state.currentTest,
      state.shuffledQuestions,
      state.userAnswers,
      state.timeLeft
    );
  }, [state.currentTest, state.shuffledQuestions, state.userAnswers, state.timeLeft, handlers]);

  const handleSubmitTest = useCallback(async () => {
    if (!ensureAllQuestionsAnswered('nộp bài thi')) return;
    await finalizeTest();
  }, [ensureAllQuestionsAnswered, finalizeTest]);

  const handleExitTest = useCallback(async () => {
    if (!ensureAllQuestionsAnswered('thoát bài thi')) return;
    await finalizeTest();
  }, [ensureAllQuestionsAnswered, finalizeTest]);

  // Timer effect
  useEffect(() => {
    let timer: number | undefined;
    const { view, currentTest, timeLeft } = state;
    
    if (view === 'test' && currentTest?.trang_thai === 'Đang thi' && timeLeft > 0) {
      timer = window.setTimeout(() => {
        state.setTimeLeft(timeLeft - 1);
      }, 1000);

      if (timeLeft <= 300) { // 5 minutes warning
        state.setIsTimeWarning(true);
      } else {
        state.setIsTimeWarning(false);
      }
    } else if (view === 'test' && timeLeft <= 0 && currentTest?.trang_thai === 'Đang thi') {
      finalizeTest();
    }
    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [state.view, state.timeLeft, state.currentTest?.trang_thai, state.currentTest?.id, finalizeTest]);

  // Extract specific values from state to avoid dependency on entire state object
  const { view, activeTab, itemToEdit, selectedKyThi, selectedBaiThi, currentTest, finalResult } = state;

  // Memoize kyThiList to prevent unnecessary recalculations
  const kyThiList = useMemo(() => data.kyThiList, [data.kyThiList]);
  const baiThiLamList = useMemo(() => data.baiThiLamList, [data.baiThiLamList]);

  // Extract state setters to avoid dependency on entire state object
  const { setView: setViewState, handleBack, setActiveTab, handleView, setSelectedBaiThi } = state;

  // Handle onViewBaiThiDetails để set selectedBaiThi cho breadcrumb (giữ nested view trong module Kỳ thi)
  const handleViewBaiThiDetails = useCallback((baiThi: BaiThiLam) => {
    setSelectedBaiThi(baiThi);
    // Không gọi onViewBaiThiDetails từ parent để giữ nested view trong module Kỳ thi
    // onViewBaiThiDetails?.(baiThi);
  }, [setSelectedBaiThi]);

  // Breadcrumb setup - ✨ Clean & Professional using custom hook
  useKyThiBreadcrumb({
    view,
    activeTab,
    itemToEdit,
    selectedKyThi,
    selectedBaiThi, // Pass selectedBaiThi
    currentTest,
    finalResult,
    kyThiList,
    baiThiLamList, // Pass baiThiLamList for nested breadcrumb navigation
    goToHome,
    goToHomeWithModule,
    goBackToMenu,
    onBack,
    setView: setViewState,
    handleBack,
    setActiveTab,
    handleView,
    setSelectedBaiThi, // Pass setSelectedBaiThi for breadcrumb navigation
  });

  // Render test view
  const renderTestView = () => {
    if (!state.currentTest || state.shuffledQuestions.length === 0) return null;

    if (state.currentTest.trang_thai === 'Chưa thi') {
      return (
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
          <div className="relative bg-card dark:bg-[#1F2937] p-8 rounded-lg shadow-xl text-center max-w-md w-full">
            <button
              type="button"
              onClick={handleBackFromPendingTest}
              className="absolute left-4 top-4 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              ← Quay lại
            </button>
            <h2 className="text-2xl font-bold">Bắt đầu bài thi</h2>
            <p className="text-lg mt-2">{state.selectedKyThi?.ten_ky_thi}</p>
            <div className="my-6 text-text-secondary space-y-2">
              <p>Số câu hỏi: {state.selectedKyThi?.so_cau_hoi}</p>
              <p>Thời gian làm bài: {state.selectedKyThi?.so_phut_lam_bai} phút</p>
            </div>
            <button 
              onClick={handleStartTimerAndTest} 
              className="w-full px-6 py-3 bg-accent text-white rounded-md text-lg font-semibold"
            >
              Bắt đầu
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;

    const answeredCount = state.userAnswers.filter(answer => answer !== null).length;
    const totalQuestions = state.shuffledQuestions.length;
    const canFinish = answeredCount === totalQuestions;
    const isFirstQuestion = state.currentQuestionIndex === 0;
    const isLastQuestion = state.currentQuestionIndex === totalQuestions - 1;

    return (
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{state.selectedKyThi?.ten_ky_thi}</h2>
            <p className="text-sm text-text-secondary mt-1">
              Đã trả lời {answeredCount}/{totalQuestions} câu hỏi
            </p>
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg p-2 bg-card rounded-md shadow transition-colors ${state.isTimeWarning ? 'text-danger animate-pulse' : ''}`}>
            <ClockIcon className="w-6 h-6" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-grow">
          <div className="bg-card dark:bg-[#1F2937] p-6 rounded-lg shadow-lg flex-1 flex flex-col">
            <div className="mb-4">
              <p className="text-sm text-text-secondary">Câu hỏi {state.currentQuestionIndex + 1}/{totalQuestions}</p>
              <p className="text-lg font-semibold mt-2">{currentQuestion.cau_hoi}</p>
            </div>

            <div className="space-y-3">
              {currentQuestion.shuffledAnswers.map((answer, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-md border-2 cursor-pointer transition-colors ${
                    state.userAnswers[state.currentQuestionIndex] === answer.originalIndex
                      ? 'bg-accent/10 border-accent'
                      : 'border-primary dark:border-gray-600 hover:bg-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={state.userAnswers[state.currentQuestionIndex] === answer.originalIndex}
                    onChange={() => handleAnswerSelect(answer.originalIndex)}
                    className="h-5 w-5 text-accent focus:ring-accent"
                  />
                  <span className="ml-4">{answer.text}</span>
                </label>
              ))}
            </div>

            <div className="mt-auto pt-6 space-y-4">
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => state.setCurrentQuestionIndex(p => p - 1)}
                  disabled={isFirstQuestion}
                  className="px-4 py-2 bg-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Câu trước
                </button>
                <button
                  type="button"
                  onClick={() => state.setCurrentQuestionIndex(p => p + 1)}
                  disabled={isLastQuestion}
                  className="px-4 py-2 bg-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Câu sau
                </button>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleExitTest}
                  disabled={!canFinish}
                  className="px-4 py-2 border border-primary rounded-md text-text-primary dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thoát bài thi
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  disabled={!canFinish}
                  className="px-6 py-2 bg-accent text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nộp bài
                </button>
              </div>
              {!canFinish && (
                <p className="text-sm text-danger text-right">
                  Bạn còn {totalQuestions - answeredCount} câu chưa trả lời.
                </p>
              )}
            </div>
          </div>

          <div className="lg:w-72 bg-card dark:bg-[#1F2937] p-4 rounded-lg shadow-lg border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-primary dark:text-white">Trình tự câu hỏi</p>
              <span className="text-xs text-text-secondary">{answeredCount}/{totalQuestions} đã trả lời</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {state.shuffledQuestions.map((question, index) => {
                const answer = state.userAnswers[index];
                const isCurrent = index === state.currentQuestionIndex;
                const isAnswered = typeof answer === 'number';
                const answerLabel = isAnswered ? ANSWER_LABELS[answer - 1] : null;
                const baseClasses = 'p-3 rounded-lg border text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-accent/40';
                const answeredClasses = isAnswered ? 'border-success bg-success/10 text-success' : 'border-primary/40 text-text-secondary';
                const currentClasses = isCurrent ? 'ring-2 ring-accent' : '';
                return (
                  <button
                    type="button"
                    key={question.id}
                    onClick={() => state.setCurrentQuestionIndex(index)}
                    className={`${baseClasses} ${answeredClasses} ${currentClasses}`}
                  >
                    <div className="font-semibold">Câu {index + 1}</div>
                    <div className="text-xs mt-1">
                      {answerLabel ? `Đáp án ${answerLabel}` : 'Chưa chọn'}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-text-secondary mt-3">
              Nhấn vào các ô để chuyển nhanh đến câu hỏi tương ứng.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render result view
  const renderResultView = () => {
    if (!state.finalResult) return null;
    const percentage = (state.finalResult.diem_so / state.finalResult.tong_so_cau) * 100;

    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        <div className="bg-card dark:bg-[#1F2937] p-8 rounded-lg shadow-xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold">Kết quả bài thi</h2>
          <p className="text-lg mt-2">{state.selectedKyThi?.ten_ky_thi}</p>
          <div className={`my-6 p-6 rounded-full w-40 h-40 mx-auto flex flex-col justify-center ${state.finalResult.trang_thai === 'Đạt' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            <p className="text-4xl font-bold">{state.finalResult.diem_so}/{state.finalResult.tong_so_cau}</p>
            <p className="text-lg font-semibold">({percentage.toFixed(0)}%)</p>
          </div>
          <p className={`text-2xl font-bold ${state.finalResult.trang_thai === 'Đạt' ? 'text-success' : 'text-danger'}`}>
            {state.finalResult.trang_thai}
          </p>
          <button 
            onClick={() => {
              state.setView('list');
              state.setFinalResult(null);
              state.handleBack();
            }} 
            className="mt-8 px-6 py-2 bg-accent text-white rounded-md"
          >
            Quay về danh sách
          </button>
        </div>
      </div>
    );
  };

  // Render main content
  const renderMainContent = () => {
    // Check view permission for list, detail, and form views
    // Test and result views don't need view permission check as they are test-taking functionality
    if (state.view !== 'test' && state.view !== 'result') {
      if (!guards.canView()) {
        return (
          <AccessDenied 
            onBack={goToHomeWithModule || goBackToMenu || onBack} 
            title="Từ chối truy cập"
            message="Bạn không có quyền xem kỳ thi. Vui lòng liên hệ quản trị viên."
          />
        );
      }
    }

    // Show loading state
    if (data.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" message="Đang tải dữ liệu..." />
        </div>
      );
    }

    // Full Page Form View (from ListView and DetailView)
    if (state.view === 'form') {
      // Check add/edit permission for form view
      const isEditing = !!state.itemToEdit?.id;
      if (isEditing && !guards.canEdit()) {
        return (
          <AccessDenied 
            onBack={state.handleCloseForm} 
            title="Từ chối truy cập"
            message="Bạn không có quyền sửa kỳ thi. Vui lòng liên hệ quản trị viên."
          />
        );
      }
      if (!isEditing && !guards.canAdd()) {
        return (
          <AccessDenied 
            onBack={state.handleCloseForm} 
            title="Từ chối truy cập"
            message="Bạn không có quyền thêm kỳ thi. Vui lòng liên hệ quản trị viên."
          />
        );
      }

      return (
        <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
          <KyThiFormView
            onBack={state.handleCloseForm}
            onSave={async (item) => {
              await handlers.handleSave(item);
              state.handleCloseForm();
            }}
            itemToEdit={state.itemToEdit}
            cauHoiList={questionList}
            donViToChuc={donViToChuc}
            chucVu={chucVu}
            nhanSu={enhancedEmployees}
          />
        </React.Suspense>
      );
    }

    if (state.view === 'detail' && state.selectedKyThi) {
      const currentItem = data.kyThiList.find(k => k.id === state.selectedKyThi!.id) || state.selectedKyThi;
      
      // Nếu có selectedBaiThi, hiển thị nested detail view của bài thi
      if (state.selectedBaiThi) {
        return (
          <React.Suspense fallback={<div className="p-4">Đang tải...</div>}>
            <BaiThiDetailView
              item={state.selectedBaiThi}
              onBack={() => {
                state.setSelectedBaiThi(null); // Quay về detail kỳ thi
              }}
              onSaveDanhGia={async (baiThiId: number, danhGia: DanhGia | null) => {
                const updated = await baiThiHandlers.handleSaveDanhGia(baiThiId, danhGia);
                // Update selectedBaiThi nếu đang xem bài thi đó
                if (updated && state.selectedBaiThi && state.selectedBaiThi.id === baiThiId) {
                  state.setSelectedBaiThi(updated);
                }
              }}
              onDelete={(items: BaiThiLam[]) => {
                // Handle delete - có thể cần implement sau
                console.log('Delete nested bai thi:', items);
              }}
              employeeMap={employeeMap}
              kyThiMap={kyThiMap}
              questionList={questionList}
            />
          </React.Suspense>
        );
      }
      
      // Hiển thị detail view của kỳ thi
      return (
        <React.Suspense fallback={<div className="p-4">Đang tải...</div>}>
          <KyThiDetailView
            item={currentItem}
            onBack={() => {
              state.setView('list');
              state.handleBack();
            }}
            onEdit={guards.canEdit() ? handleEdit : undefined}
            onDelete={guards.canDelete() ? handleDelete : undefined}
            onStartTest={handleStartTest}
            onContinueTest={handleContinueTest}
            onViewMyTests={onViewMyTests || (() => {})}
            baiThiLamList={data.baiThiLamList}
            onViewBaiThiDetails={handleViewBaiThiDetails}
          />
        </React.Suspense>
      );
    }

    if (state.view === 'test') {
      return renderTestView();
    }

    if (state.view === 'result') {
      return renderResultView();
    }

    return (
      <React.Suspense fallback={<div className="p-4">Đang tải...</div>}>
        <KyThiListView
          items={data.filteredItems}
          employeeMap={data.employeeMap}
          onAdd={guards.canAdd() ? handleAdd : undefined}
          onEdit={guards.canEdit() ? handleEdit : undefined}
          onDelete={guards.canDelete() ? handleDelete : undefined}
          onViewDetails={(item) => {
            state.handleView(item);
          }}
          onBack={goToHomeWithModule || goBackToMenu || onBack}
          activeTab={state.activeTab}
          onTabChange={state.setActiveTab}
          getMyStatus={data.getMyStatus}
        />
      </React.Suspense>
    );
  };

  return (
    <ErrorBoundary>
      {renderMainContent()}

      {/* Form Modal (for inline tables - not currently used but kept for consistency) */}
      {state.isFormModalOpen && (
        <Modal
          isOpen={true}
          onClose={state.handleCloseFormModal}
          title={state.itemToEditInModal?.id ? "Sửa kỳ thi" : "Tạo kỳ thi mới"}
          disableClickOutside={true}
        >
          <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
            <KyThiFormView
              onBack={state.handleCloseFormModal}
              onSave={async (item) => {
                await handlers.handleSave(item);
                state.handleCloseFormModal();
              }}
              itemToEdit={state.itemToEditInModal}
              cauHoiList={questionList}
              donViToChuc={donViToChuc}
              chucVu={chucVu}
              nhanSu={enhancedEmployees}
            />
          </React.Suspense>
        </Modal>
      )}

      {state.deleteModal && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => state.setDeleteModal(null)}
          onConfirm={confirmDelete}
          title="Xác nhận xóa"
          message={
            state.deleteModal.isBulk
              ? `Bạn có chắc muốn xóa ${state.deleteModal.items.length} kỳ thi đã chọn?`
              : <>Bạn có chắc muốn xóa kỳ thi <strong>"{state.deleteModal.items[0].ten_ky_thi}"</strong>?</>
          }
          variant="danger"
        />
      )}
    </ErrorBoundary>
  );
};

export default KyThiRouter;

