/**
 * useBaiThiNavigation Hook
 * 
 * Manages navigation callbacks for BaiThi module
 * Centralized navigation logic for better maintainability
 */

import { useBreadcrumbContext } from '@lib/breadcrumb/BreadcrumbContext';
import { useGoToHomeWithModule } from '@lib/hooks/useGoToHomeWithModule';
import { useCallback, useMemo } from 'react';

interface UseBaiThiNavigationParams {
  goToHome?: () => void;
  goToHomeWithModule?: () => void;
  goBackToMenu?: () => void;
  onBack?: () => void;
}

interface BaiThiNavigation {
  home: () => void;
  function: () => void;
  module: () => void;
  goToHomeWithWorkModule: () => void;
}

/**
 * Manages navigation callbacks for BaiThi module
 * 
 * @param params - Navigation callback parameters
 * @returns Navigation callbacks object
 */
export function useBaiThiNavigation({
  goToHome,
  goToHomeWithModule,
  goBackToMenu,
  onBack,
}: UseBaiThiNavigationParams): BaiThiNavigation {
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

  // Module navigation (fallback chain)
  const moduleNavigation = useMemo(() => {
    return goToHomeWithModule || goToHomeWithWorkModule || goBackToMenu || onBack || (() => {});
  }, [goToHomeWithModule, goToHomeWithWorkModule, goBackToMenu, onBack]);

  return {
    home: memoizedGoToHome,
    function: functionNavigation,
    module: moduleNavigation,
    goToHomeWithWorkModule,
  };
}
