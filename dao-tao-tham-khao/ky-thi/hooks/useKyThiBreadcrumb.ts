/**
 * useKyThiBreadcrumb Hook
 * 
 * Complete breadcrumb hook for KyThi module
 * Combines viewState derivation and navigation
 */

import { useBreadcrumb } from '@lib/breadcrumb';
import { useActiveView } from '@lib/contexts/ActiveViewContext';
import { type BaiThiLam, type KyThi } from '@src/types';
import { useCallback } from 'react';
import { useKyThiBreadcrumbViewState } from './useKyThiBreadcrumbViewState';
import { useKyThiNavigation } from './useKyThiNavigation';

interface UseKyThiBreadcrumbParams {
  // Router state
  view: 'list' | 'detail' | 'form' | 'test' | 'result';
  activeTab: 'all' | 'my';
  itemToEdit?: KyThi | null;
  selectedKyThi?: KyThi | null;
  selectedBaiThi?: BaiThiLam | null; // Thêm selectedBaiThi
  currentTest?: BaiThiLam | null;
  finalResult?: BaiThiLam | null;
  kyThiList: KyThi[];
  baiThiLamList: BaiThiLam[]; // Thêm baiThiLamList cho nested breadcrumb navigation
  
  // Navigation
  goToHome?: () => void;
  goToHomeWithModule?: () => void;
  goBackToMenu?: () => void;
  onBack?: () => void;
  
  // Breadcrumb click handler (optional - for custom navigation)
  onBreadcrumbClick?: (
    targetLabel: string,
    targetIndex?: number,
    targetItemId?: number
  ) => void;
  
  // State setters for breadcrumb navigation
  setView?: (view: 'list' | 'detail' | 'form' | 'test' | 'result') => void;
  handleBack?: () => void;
  setActiveTab?: (tab: 'all' | 'my') => void;
  handleView?: (item: KyThi) => void;
  setSelectedBaiThi?: (baiThi: BaiThiLam | null) => void; // Thêm setSelectedBaiThi cho nested breadcrumb navigation
}

/**
 * Complete breadcrumb hook for KyThi module
 * 
 * @param params - All parameters needed for breadcrumb setup
 */
export function useKyThiBreadcrumb({
  view,
  activeTab,
  itemToEdit,
  selectedKyThi,
  selectedBaiThi, // Thêm selectedBaiThi
  currentTest,
  finalResult,
  kyThiList,
  baiThiLamList, // Thêm baiThiLamList
  goToHome,
  goToHomeWithModule,
  goBackToMenu,
  onBack,
  onBreadcrumbClick,
  setView: setViewState,
  handleBack,
  setActiveTab,
  handleView,
  setSelectedBaiThi, // Thêm setSelectedBaiThi
}: UseKyThiBreadcrumbParams) {
  const { activeView } = useActiveView();
  
  // Derive viewState from router state
  const breadcrumbViewState = useKyThiBreadcrumbViewState({
    view,
    activeTab,
    itemToEdit,
    selectedKyThi,
    selectedBaiThi, // Pass selectedBaiThi
    currentTest,
    finalResult,
    kyThiList,
  });
  
  // Get navigation callbacks
  const navigation = useKyThiNavigation({
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
      // Click vào "Kỳ thi" (module) -> quay về list view với tab "Tất cả"
      setViewState?.('list');
      handleBack?.();
      setActiveTab?.('all');
      setSelectedBaiThi?.(null); // Clear nested selection
    } else if (itemType === 'tab') {
      // Click vào "Tất cả" hoặc "Của tôi" (tab) -> quay về list view với tab tương ứng
      setViewState?.('list');
      handleBack?.();
      // Determine tab from breadcrumb path (need to check viewState)
      // For now, use activeTab or default to 'all'
      setActiveTab?.(activeTab || 'all');
      setSelectedBaiThi?.(null); // Clear nested selection
    } else if (itemType === 'ky_thi' || itemType === 'item') {
      // Click vào tên kỳ thi -> quay về detail view của kỳ thi đó
      if (targetItemId && handleView) {
        const kyThi = kyThiList.find(k => k.id === targetItemId);
        if (kyThi) {
          setSelectedBaiThi?.(null); // Clear nested selection khi quay về kỳ thi
          handleView(kyThi);
        }
      }
    } else if (itemType === 'bai_thi') {
      // Click vào tên bài thi -> hiển thị nested detail của bài thi
      if (targetItemId && setSelectedBaiThi) {
        const baiThi = baiThiLamList.find(b => b.id === targetItemId);
        if (baiThi) {
          setSelectedBaiThi(baiThi);
        } else {
          setSelectedBaiThi(null);
        }
      }
    } else if (itemType === 'function') {
      // Click vào "Công việc" (function)
      navigation.function();
    }
  }, [
    setViewState,
    handleBack,
    setActiveTab,
    handleView,
    navigation,
    setSelectedBaiThi,
    kyThiList,
    baiThiLamList,
    activeTab,
  ]);
  
  // Setup breadcrumb với navigation callbacks đúng
  useBreadcrumb({
    moduleKey: 'chung_ky_thi',
    viewState: breadcrumbViewState,
    navigation: {
      home: navigation.home,
      function: navigation.function,
      module: () => {
        // Click vào "Kỳ thi" (module) -> quay về list view
        setViewState?.('list');
        handleBack?.();
        setActiveTab?.('all');
        setSelectedBaiThi?.(null);
      },
      tab: (tabId) => {
        // Click vào tab -> quay về list view với tab tương ứng
        const tabMap: Record<string, 'all' | 'my'> = {
          'Tất cả': 'all',
          'Của tôi': 'my',
        };
        // tabId có thể là label ("Tất cả", "Của tôi") hoặc id
        const tab = tabMap[tabId] || tabMap[tabId as string] || activeTab || 'all';
        setViewState?.('list');
        handleBack?.();
        setActiveTab?.(tab);
        setSelectedBaiThi?.(null);
      },
      item: (itemId, itemType) => {
        // Handle item navigation
        const targetItemId = typeof itemId === 'number' 
          ? itemId 
          : (typeof itemId === 'string' ? parseInt(itemId, 10) : undefined);

        if (itemType === 'ky_thi' && handleView && targetItemId) {
          const kyThi = kyThiList.find(k => k.id === targetItemId);
          if (kyThi) {
            setSelectedBaiThi?.(null); // Clear nested selection
            handleView(kyThi);
          }
        } else if (itemType === 'bai_thi' && setSelectedBaiThi && targetItemId) {
          // Handle nested bai_thi navigation (giữ trong module Kỳ thi)
          const baiThi = baiThiLamList.find(b => b.id === targetItemId);
          if (baiThi) {
            setSelectedBaiThi(baiThi);
          } else {
            setSelectedBaiThi(null);
          }
        }
      },
    },
    currentView: activeView,
    onBreadcrumbClick: (itemId, itemType, itemIndex) => {
      // Use custom handler if provided, otherwise use default
      if (onBreadcrumbClick) {
        // Convert signature for backward compatibility
        const targetItemId = typeof itemId === 'number' 
          ? itemId 
          : (typeof itemId === 'string' ? parseInt(itemId, 10) : undefined);
        onBreadcrumbClick(
          itemType || 'module', 
          itemIndex, 
          targetItemId && !isNaN(targetItemId) ? targetItemId : undefined
        );
      } else {
        defaultBreadcrumbClick(itemId, itemType, itemIndex);
      }
    },
  });
  
  return {
    viewState: breadcrumbViewState,
    navigation,
  };
}
