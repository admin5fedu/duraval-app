/**
 * ChuyenDeMainRouter Component
 * 
 * Main router component that orchestrates 3 sub-modules:
 * - nhom-chuyen-de (Nhóm chuyên đề)
 * - chuyen-de (Chuyên đề)
 * - cau-hoi (Câu hỏi)
 * 
 * Uses tabs to switch between sub-modules and manages navigation between them
 */

import AccessDenied from '@components/ui/AccessDenied';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import TabsGroup from '@components/ui/navigation/TabsGroup';
import { ToastContext } from '@lib/contexts/ToastContext';
import { useMultiTabListView } from '@lib/hooks/foundation';
import { useCauHoi, useChuyenDe, useChuyenDeNhom } from '@lib/hooks/queries/useTraining';
import { DocumentTextIcon, FolderIcon, QuestionMarkCircleIcon } from '@src/assets/icons';
import React, { Suspense, useCallback, useContext, useRef, useState } from 'react';
import { useChuyenDeMainBreadcrumb } from '../hooks/useChuyenDeMainBreadcrumb';
import { useCauHoiPermissionGuards, useChuyenDePermissionGuards } from '../utils/chuyenDePermissions';
// Lazy load router components
const ChuyenDeNhomRouter = React.lazy(() => import('../nhom-chuyen-de/components/ChuyenDeNhomRouter'));
const ChuyenDeRouter = React.lazy(() => import('../chuyen-de/components/ChuyenDeRouter'));
const CauHoiRouter = React.lazy(() => import('../cau-hoi/components/CauHoiRouter'));

// Loading fallback
const RouterLoadingFallback = () => <div className="p-4">Đang tải...</div>;

interface ChuyenDeMainRouterProps {
  onBack?: () => void;
  goBackToMenu?: () => void;
  goToHome?: () => void;
}

const ChuyenDeMainRouter: React.FC<ChuyenDeMainRouterProps> = ({
  onBack,
  goBackToMenu,
  goToHome,
}) => {
  const { addToast } = useContext(ToastContext);
  
  // Get permission guards for chuyen-de modules
  const guardsChuyenDe = useChuyenDePermissionGuards();
  const guardsCauHoi = useCauHoiPermissionGuards();

  // Track current view from active sub-router for breadcrumb
  // Use refs to store previous values for deep comparison
  const subRouterViewRef = useRef<{
    type: 'list' | 'detail' | 'form';
    section: string;
    selectedItems?: Array<{ id: number; name: string; type: string }>;
    formMode?: 'add' | 'edit';
  } | null>(null);
  
  const [subRouterView, setSubRouterView] = useState<{
    type: 'list' | 'detail' | 'form';
    section: string;
    selectedItems?: Array<{ id: number; name: string; type: string }>;
    formMode?: 'add' | 'edit';
  } | null>(null);

  // Fetch data for tab counts
  const { data: groupList = [] } = useChuyenDeNhom();
  const { data: topicList = [] } = useChuyenDe();
  const { data: questionList = [] } = useCauHoi();

  // Multi-tab management
  const multiTab = useMultiTabListView({
    tabs: [
      { id: 'groups', label: 'Nhóm', icon: FolderIcon, count: groupList.length },
      { id: 'topics', label: 'Chuyên đề', icon: DocumentTextIcon, count: topicList.length },
      { id: 'questions', label: 'Câu hỏi', icon: QuestionMarkCircleIcon, count: questionList.length },
    ],
    defaultTab: 'groups',
    storageKey: 'chuyen-de-main-activeTab',
  });

  // Reset sub-router view when switching tabs
  React.useEffect(() => {
    setSubRouterView(null);
    subRouterViewRef.current = null;
  }, [multiTab.activeTab]);

  // State for initial values when opening forms from InlineListTable
  const [initialTopicGroupId, setInitialTopicGroupId] = useState<number | null>(null);
  const [initialQuestionTopicId, setInitialQuestionTopicId] = useState<number | null>(null);
  
  // State for navigation from breadcrumb
  const [navigateToNhomId, setNavigateToNhomId] = useState<number | null>(null);
  const [navigateToChuyenDeId, setNavigateToChuyenDeId] = useState<number | null>(null);
  const [navigateToCauHoiId, setNavigateToCauHoiId] = useState<number | null>(null);

  // Navigation callbacks between sub-modules
  const handleViewTopicDetails = useCallback((topicId: number) => {
    // Switch to topics tab and navigate to topic detail
    multiTab.setActiveTab('topics');
    // The ChuyenDeRouter will handle the detail view
  }, [multiTab]);

  const handleAddTopic = useCallback((groupId: number) => {
    // Switch to topics tab and open form with pre-filled groupId
    setInitialTopicGroupId(groupId);
    multiTab.setActiveTab('topics');
    // The ChuyenDeRouter will handle the form
  }, [multiTab]);

  const handleViewQuestionDetails = useCallback((questionId: number) => {
    // Switch to questions tab and navigate to question detail
    multiTab.setActiveTab('questions');
    // The CauHoiRouter will handle the detail view
  }, [multiTab]);

  const handleAddQuestion = useCallback((topicId: number) => {
    // Switch to questions tab and open form with pre-filled topicId
    setInitialQuestionTopicId(topicId);
    multiTab.setActiveTab('questions');
    // The CauHoiRouter will handle the form
  }, [multiTab]);

  // Handlers for breadcrumb navigation to nested items
  const handleViewNhomDetails = useCallback((nhomId: number) => {
    // Set navigateToId and switch to groups tab
    setNavigateToNhomId(nhomId);
    multiTab.setActiveTab('groups');
    // Clear after navigation
    setTimeout(() => setNavigateToNhomId(null), 100);
  }, [multiTab]);

  const handleViewChuyenDeDetails = useCallback((chuyenDeId: number) => {
    // Set navigateToId and switch to topics tab
    setNavigateToChuyenDeId(chuyenDeId);
    multiTab.setActiveTab('topics');
    // Clear after navigation
    setTimeout(() => setNavigateToChuyenDeId(null), 100);
  }, [multiTab]);

  const handleViewCauHoiDetails = useCallback((cauHoiId: number) => {
    // Set navigateToId and switch to questions tab
    setNavigateToCauHoiId(cauHoiId);
    multiTab.setActiveTab('questions');
    // Clear after navigation
    setTimeout(() => setNavigateToCauHoiId(null), 100);
  }, [multiTab]);
  
  // Clear navigation IDs when switching tabs
  React.useEffect(() => {
    setNavigateToNhomId(null);
    setNavigateToChuyenDeId(null);
    setNavigateToCauHoiId(null);
  }, [multiTab.activeTab]);

  // Clear initial values when switching tabs
  React.useEffect(() => {
    setInitialTopicGroupId(null);
    setInitialQuestionTopicId(null);
  }, [multiTab.activeTab]);

  const memoizedOnBack = useCallback(() => {
    if (onBack) onBack();
  }, [onBack]);

  // Handle view changes from sub-routers
  // Only update if view actually changed (deep comparison to prevent infinite loop)
  const handleViewChange = useCallback((view: {
    type: 'list' | 'detail' | 'form';
    section: string;
    selectedItems?: Array<{ id: number; name: string; type: string }>;
    formMode?: 'add' | 'edit';
  }) => {
    const prev = subRouterViewRef.current;
    
    // Deep comparison: only update if view actually changed
    if (!prev ||
        prev.type !== view.type ||
        prev.section !== view.section ||
        prev.formMode !== view.formMode ||
        JSON.stringify(prev.selectedItems) !== JSON.stringify(view.selectedItems)) {
      subRouterViewRef.current = view;
      setSubRouterView(view);
    }
  }, []);

  // Breadcrumb setup - ✨ Clean & Professional using custom hook (after handleViewChange is defined)
  useChuyenDeMainBreadcrumb({
    activeTab: multiTab.activeTab,
    subRouterView,
    goToHome,
    goBackToMenu,
    onBack,
    setActiveTab: multiTab.setActiveTab,
    onViewNhomDetails: handleViewNhomDetails,
    onViewChuyenDeDetails: handleViewChuyenDeDetails,
    onViewCauHoiDetails: handleViewCauHoiDetails,
  });

  // Render active sub-module router
  const renderActiveRouter = () => {
    switch (multiTab.activeTab) {
      case 'groups':
        // Check permission for nhom chuyen de (uses chung_chuyen_de)
        if (!guardsChuyenDe.canView()) {
          return (
            <AccessDenied 
              onBack={memoizedOnBack} 
              title="Từ chối truy cập"
              message="Bạn không có quyền xem nhóm chuyên đề. Vui lòng liên hệ quản trị viên."
            />
          );
        }
        return (
          <Suspense fallback={<RouterLoadingFallback />}>
            <ChuyenDeNhomRouter
              onBack={memoizedOnBack}
              onViewTopicDetails={handleViewTopicDetails}
              onAddTopic={handleAddTopic}
              onViewChange={handleViewChange}
              navigateToId={navigateToNhomId}
            />
          </Suspense>
        );
      case 'topics':
        // Check permission for chuyen de (uses chung_chuyen_de)
        if (!guardsChuyenDe.canView()) {
          return (
            <AccessDenied 
              onBack={memoizedOnBack} 
              title="Từ chối truy cập"
              message="Bạn không có quyền xem chuyên đề. Vui lòng liên hệ quản trị viên."
            />
          );
        }
        return (
          <Suspense fallback={<RouterLoadingFallback />}>
            <ChuyenDeRouter
              onBack={memoizedOnBack}
              onViewQuestionDetails={handleViewQuestionDetails}
              onAddQuestion={handleAddQuestion}
              onViewChange={handleViewChange}
              initialGroupId={initialTopicGroupId}
              navigateToId={navigateToChuyenDeId}
            />
          </Suspense>
        );
      case 'questions':
        // Check permission for cau hoi (uses chung_danh_sach_cau_hoi)
        if (!guardsCauHoi.canView()) {
          return (
            <AccessDenied 
              onBack={memoizedOnBack} 
              title="Từ chối truy cập"
              message="Bạn không có quyền xem câu hỏi. Vui lòng liên hệ quản trị viên."
            />
          );
        }
        return (
          <Suspense fallback={<RouterLoadingFallback />}>
            <CauHoiRouter
              onBack={memoizedOnBack}
              onViewChange={handleViewChange}
              initialTopicId={initialQuestionTopicId}
              navigateToId={navigateToCauHoiId}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="border-b border-primary dark:border-gray-700 bg-background dark:bg-[#111827]">
        <TabsGroup
          tabs={multiTab.tabs}
          activeTab={multiTab.activeTab}
          onTabChange={multiTab.setActiveTab}
        />
      </div>

      {/* Active sub-module router */}
      <div className="flex-1 overflow-auto">
        <ErrorBoundary>
          {renderActiveRouter()}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ChuyenDeMainRouter;

