/**
 * useChuyenDeMainBreadcrumb Hook
 * 
 * Complete breadcrumb hook for ChuyenDeMain module
 * Combines viewState derivation and navigation
 */

import { useBreadcrumb } from '@lib/breadcrumb';
import { useActiveView } from '@lib/contexts/ActiveViewContext';
import { useChuyenDeMainBreadcrumbViewState } from './useChuyenDeMainBreadcrumbViewState';
import { useChuyenDeMainNavigation } from './useChuyenDeMainNavigation';

interface SubRouterView {
  type: 'list' | 'detail' | 'form';
  section: string;
  selectedItems?: Array<{ id: number; name: string; type: string }>;
  formMode?: 'add' | 'edit';
}

interface UseChuyenDeMainBreadcrumbParams {
  // Router state
  activeTab: 'groups' | 'topics' | 'questions';
  subRouterView: SubRouterView | null;
  
  // Navigation
  goToHome?: () => void;
  goBackToMenu?: () => void;
  onBack?: () => void;
  setActiveTab?: (tab: 'groups' | 'topics' | 'questions') => void;
  
  // Handlers for nested items navigation (optional - for breadcrumb navigation)
  onViewNhomDetails?: (nhomId: number) => void;
  onViewChuyenDeDetails?: (chuyenDeId: number) => void;
  onViewCauHoiDetails?: (cauHoiId: number) => void;
}

/**
 * Complete breadcrumb hook for ChuyenDeMain module
 * 
 * @param params - All parameters needed for breadcrumb setup
 */
export function useChuyenDeMainBreadcrumb({
  activeTab,
  subRouterView,
  goToHome,
  goBackToMenu,
  onBack,
  setActiveTab,
  onViewNhomDetails,
  onViewChuyenDeDetails,
  onViewCauHoiDetails,
}: UseChuyenDeMainBreadcrumbParams) {
  const { activeView } = useActiveView();
  
  // Derive viewState from router state
  const breadcrumbViewState = useChuyenDeMainBreadcrumbViewState({
    activeTab,
    subRouterView,
  });
  
  // Get navigation callbacks
  const navigation = useChuyenDeMainNavigation({
    goToHome,
    goBackToMenu,
    onBack,
    setActiveTab,
  });
  
  // Setup breadcrumb với navigation callbacks đúng
  useBreadcrumb({
    moduleKey: 'chung_chuyen_de',
    viewState: breadcrumbViewState,
    navigation: {
      home: goToHome,
      function: navigation.function,
      module: () => {
        // Click vào "Chuyên đề" (module) -> quay về list view tab đầu tiên (Nhóm)
        setActiveTab?.('groups');
      },
      tab: (tabId) => {
        // Click vào tab -> switch sang tab tương ứng
        const tabMap: Record<string, 'groups' | 'topics' | 'questions'> = {
          'Nhóm': 'groups',
          'Chuyên đề': 'topics',
          'Câu hỏi': 'questions',
        };
        // tabId có thể là label ("Nhóm", "Chuyên đề", "Câu hỏi")
        const tab = tabMap[tabId] || tabMap[tabId as string] || 'groups';
        setActiveTab?.(tab);
      },
      item: (itemId, itemType) => {
        // Handle nested item navigation
        const targetItemId = typeof itemId === 'number' 
          ? itemId 
          : (typeof itemId === 'string' ? parseInt(itemId, 10) : undefined);

        if (itemType === 'chuyen_de_nhom' && onViewNhomDetails && targetItemId) {
          // Click vào nhóm chuyên đề -> handler sẽ switch tab và navigate đến detail
          onViewNhomDetails(targetItemId);
        } else if (itemType === 'chuyen_de' && onViewChuyenDeDetails && targetItemId) {
          // Click vào chuyên đề -> handler sẽ switch tab và navigate đến detail
          onViewChuyenDeDetails(targetItemId);
        } else if (itemType === 'cau_hoi' && onViewCauHoiDetails && targetItemId) {
          // Click vào câu hỏi -> handler sẽ switch tab và navigate đến detail
          onViewCauHoiDetails(targetItemId);
        }
      },
    },
    currentView: activeView,
    onBreadcrumbClick: (itemId, itemType, itemIndex) => {
      // Use navigation handler
      navigation.handleBreadcrumbClick(itemId, itemType, itemIndex);
    },
  });
  
  return {
    viewState: breadcrumbViewState,
    navigation,
  };
}
