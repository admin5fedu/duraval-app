/**
 * useChuyenDeMainNavigation Hook
 * 
 * Manages navigation callbacks for ChuyenDeMain module
 * Centralized navigation logic for better maintainability
 */

import { useBreadcrumbContext } from '@lib/breadcrumb/BreadcrumbContext';
import { useGoToHomeWithModule } from '@lib/hooks/useGoToHomeWithModule';
import { useCallback, useMemo } from 'react';

interface UseChuyenDeMainNavigationParams {
  goToHome?: () => void;
  goBackToMenu?: () => void;
  onBack?: () => void;
  setActiveTab?: (tab: 'groups' | 'topics' | 'questions') => void;
}

interface ChuyenDeMainNavigation {
  home: () => void;
  function: () => void;
  module: () => void;
  goToHomeWithWorkModule: () => void;
  handleBreadcrumbClick: (
    itemId: string | number,
    itemType: string,
    itemIndex: number
  ) => void;
}

/**
 * Manages navigation callbacks for ChuyenDeMain module
 * 
 * @param params - Navigation callback parameters
 * @returns Navigation callbacks object
 */
export function useChuyenDeMainNavigation({
  goToHome,
  goBackToMenu,
  onBack,
  setActiveTab,
}: UseChuyenDeMainNavigationParams): ChuyenDeMainNavigation {
  const { clear } = useBreadcrumbContext();
  
  // Memoize goToHome callback
  const memoizedGoToHome = useCallback(() => {
    goToHome?.();
  }, [goToHome]);

  // Create module navigation using useGoToHomeWithModule
  const goToHomeWithWorkModule = useGoToHomeWithModule(
    'Công việc', 
    memoizedGoToHome
  );

  // Function navigation - quay về submenu "Công việc" và clear breadcrumb
  const functionNavigation = useCallback(() => {
    clear(); // Clear breadcrumb về chỉ "Trang chủ"
    goBackToMenu?.();
  }, [clear, goBackToMenu]);

  // Module navigation
  const moduleNavigation = useMemo(() => {
    return goToHomeWithWorkModule || goBackToMenu || onBack || (() => {});
  }, [goToHomeWithWorkModule, goBackToMenu, onBack]);

  // Breadcrumb click handler - xử lý dựa trên itemType thay vì targetLabel
  const handleBreadcrumbClick = useCallback((
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
      // Click vào "Chuyên đề" (module) -> quay về list view tab đầu tiên (Nhóm)
      setActiveTab?.('groups');
    } else if (itemType === 'tab') {
      // Click vào tab -> switch sang tab tương ứng
      const tabMap: Record<string, 'groups' | 'topics' | 'questions'> = {
        'Nhóm': 'groups',
        'Chuyên đề': 'topics',
        'Câu hỏi': 'questions',
      };
      // itemId có thể là label ("Nhóm", "Chuyên đề", "Câu hỏi")
      const tab = tabMap[itemId as string] || 'groups';
      setActiveTab?.(tab);
    } else if (itemType === 'function') {
      // Click vào "Công việc" (function)
      functionNavigation();
    }
    // Nested items (nhom_chuyen_de, chuyen_de, cau_hoi) sẽ được xử lý bởi navigation.item callback
  }, [setActiveTab, functionNavigation]);

  return {
    home: memoizedGoToHome,
    function: functionNavigation,
    module: moduleNavigation,
    goToHomeWithWorkModule,
    handleBreadcrumbClick,
  };
}
