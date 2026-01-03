/**
 * useBaiThiBreadcrumb Hook
 * 
 * Complete breadcrumb hook for BaiThi module
 * Combines viewState derivation and navigation
 */

import { useBreadcrumb } from '@lib/breadcrumb';
import { useActiveView } from '@lib/contexts/ActiveViewContext';
import { type BaiThiLam } from '@src/types';
import { useCallback } from 'react';
import { useBaiThiBreadcrumbViewState } from './useBaiThiBreadcrumbViewState';
import { useBaiThiNavigation } from './useBaiThiNavigation';

interface UseBaiThiBreadcrumbParams {
  // Router state
  view: 'list' | 'detail';
  activeTab: 'all' | 'my';
  isFormOpen: boolean;
  itemToEdit?: Partial<BaiThiLam> | null;
  selectedBaiThi?: BaiThiLam | null;
  employeeMap: Map<number, string>;
  baiThiLamList: BaiThiLam[];
  
  // Navigation
  goToHome?: () => void;
  goToHomeWithModule?: () => void;
  goBackToMenu?: () => void;
  onBack?: () => void;
  
  // State setters for breadcrumb navigation
  handleBackToList?: () => void;
  setActiveTab?: (tab: 'all' | 'my') => void;
  handleViewDetails?: (item: BaiThiLam) => void;
}

/**
 * Complete breadcrumb hook for BaiThi module
 * 
 * @param params - All parameters needed for breadcrumb setup
 */
export function useBaiThiBreadcrumb({
  view,
  activeTab,
  isFormOpen,
  itemToEdit,
  selectedBaiThi,
  employeeMap,
  baiThiLamList,
  goToHome,
  goToHomeWithModule,
  goBackToMenu,
  onBack,
  handleBackToList,
  setActiveTab,
  handleViewDetails,
}: UseBaiThiBreadcrumbParams) {
  const { activeView } = useActiveView();
  
  // Derive viewState from router state
  const breadcrumbViewState = useBaiThiBreadcrumbViewState({
    view,
    activeTab,
    isFormOpen,
    itemToEdit,
    selectedBaiThi,
    employeeMap,
  });
  
  // Get navigation callbacks
  const navigation = useBaiThiNavigation({
    goToHome,
    goToHomeWithModule,
    goBackToMenu,
    onBack,
  });
  
  // Default breadcrumb click handler - xử lý dựa trên itemType thay vì targetLabel
  const defaultBreadcrumbClick = useCallback((
    itemId: string | number,
    itemType: string,
    itemIndex: number
  ) => {
    // Convert itemId to number if needed
    const targetItemId = typeof itemId === 'number' 
      ? itemId 
      : (typeof itemId === 'string' ? parseInt(itemId, 10) : undefined);

    // Xử lý navigation dựa trên itemType
    if (itemType === 'module') {
      // Click vào "Bài thi" (module) -> quay về list view với tab "Tất cả"
      handleBackToList?.();
      setActiveTab?.('all');
    } else if (itemType === 'tab') {
      // Click vào "Tất cả" hoặc "Của tôi" (tab) -> quay về list view với tab tương ứng
      handleBackToList?.();
      // Determine tab from breadcrumb path
      const tabMap: Record<string, 'all' | 'my'> = {
        'Tất cả': 'all',
        'Của tôi': 'my',
      };
      // tabId có thể là label ("Tất cả", "Của tôi") hoặc id
      const tab = tabMap[itemId as string] || activeTab || 'all';
      setActiveTab?.(tab);
    } else if (itemType === 'bai_thi') {
      // Click vào tên bài thi -> quay về detail view của bài thi đó
      if (targetItemId && handleViewDetails) {
        const baiThi = baiThiLamList.find(b => b.id === targetItemId);
        if (baiThi) {
          handleViewDetails(baiThi);
        }
      }
    } else if (itemType === 'function') {
      // Click vào "Công việc" (function)
      navigation.function();
    }
  }, [
    handleBackToList,
    setActiveTab,
    handleViewDetails,
    navigation,
    baiThiLamList,
    activeTab,
  ]);

  // Setup breadcrumb với navigation callbacks đúng
  useBreadcrumb({
    moduleKey: 'chung_bai_thi',
    viewState: breadcrumbViewState,
    navigation: {
      home: navigation.home,
      function: navigation.function,
      module: () => {
        // Click vào "Bài thi" (module) -> quay về list view
        handleBackToList?.();
        setActiveTab?.('all');
      },
      tab: (tabId) => {
        // Click vào tab -> quay về list view với tab tương ứng
        const tabMap: Record<string, 'all' | 'my'> = {
          'Tất cả': 'all',
          'Của tôi': 'my',
        };
        // tabId có thể là label ("Tất cả", "Của tôi") hoặc id
        const tab = tabMap[tabId] || tabMap[tabId as string] || activeTab || 'all';
        handleBackToList?.();
        setActiveTab?.(tab);
      },
      item: (itemId, itemType) => {
        // Handle item navigation
        const targetItemId = typeof itemId === 'number' 
          ? itemId 
          : (typeof itemId === 'string' ? parseInt(itemId, 10) : undefined);

        if (itemType === 'bai_thi' && handleViewDetails && targetItemId) {
          const baiThi = baiThiLamList.find(b => b.id === targetItemId);
          if (baiThi) {
            handleViewDetails(baiThi);
          }
        }
      },
    },
    currentView: activeView,
    onBreadcrumbClick: (itemId, itemType, itemIndex) => {
      // Use custom handler if provided, otherwise use default
      defaultBreadcrumbClick(itemId, itemType, itemIndex);
    },
  });
  
  return {
    viewState: breadcrumbViewState,
    navigation,
  };
}
