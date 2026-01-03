/**
 * useChuyenDeMainBreadcrumbViewState Hook
 * 
 * Derives breadcrumb view state from router state
 * Separated for better testability and reusability
 */

import { type BreadcrumbViewState } from '@lib/breadcrumb';
import { useMemo } from 'react';

interface SubRouterView {
  type: 'list' | 'detail' | 'form';
  section: string;
  selectedItems?: Array<{ id: number; name: string; type: string }>;
  formMode?: 'add' | 'edit';
}

interface UseChuyenDeMainBreadcrumbViewStateParams {
  activeTab: 'groups' | 'topics' | 'questions';
  subRouterView: SubRouterView | null;
}

/**
 * Derives breadcrumb view state from router state
 * 
 * @param params - Router state parameters
 * @returns BreadcrumbViewState for useBreadcrumb hook
 */
export function useChuyenDeMainBreadcrumbViewState({
  activeTab,
  subRouterView,
}: UseChuyenDeMainBreadcrumbViewStateParams): BreadcrumbViewState {
  return useMemo(() => {
    const tabLabels: Record<string, string> = {
      groups: 'Nhóm',
      topics: 'Chuyên đề',
      questions: 'Câu hỏi',
    };

    const tabLabel = tabLabels[activeTab] || 'Nhóm';

    // If sub-router has provided view info, use it (merge with tab)
    if (subRouterView) {
      return {
        ...subRouterView,
        tab: tabLabel,
      };
    }

    // Default: list view for the active tab
    return {
      type: 'list',
      section: 'Chuyên đề',
      tab: tabLabel,
    };
  }, [activeTab, subRouterView]);
}
