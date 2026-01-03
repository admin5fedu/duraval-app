/**
 * useBaiThiBreadcrumbViewState Hook
 * 
 * Derives breadcrumb view state from router state
 * Separated for better testability and reusability
 */

import { type BreadcrumbViewState } from '@lib/breadcrumb';
import { type BaiThiLam } from '@src/types';
import { useMemo } from 'react';
import { getBaiThiTabLabel } from '../utils/baiThiHelpers';

interface UseBaiThiBreadcrumbViewStateParams {
  view: 'list' | 'detail';
  activeTab: 'all' | 'my';
  isFormOpen: boolean;
  itemToEdit?: Partial<BaiThiLam> | null;
  selectedBaiThi?: BaiThiLam | null;
  employeeMap: Map<number, string>;
}

/**
 * Derives breadcrumb view state from router state
 * 
 * @param params - Router state parameters
 * @returns BreadcrumbViewState for useBreadcrumb hook
 */
export function useBaiThiBreadcrumbViewState({
  view,
  activeTab,
  isFormOpen,
  itemToEdit,
  selectedBaiThi,
  employeeMap,
}: UseBaiThiBreadcrumbViewStateParams): BreadcrumbViewState {
  return useMemo(() => {
    const tabLabel = getBaiThiTabLabel(activeTab);

    // Form view
    if (isFormOpen) {
      return {
        type: 'form',
        function: 'Công việc',
        module: 'Bài thi',
        tab: tabLabel,
        items: itemToEdit?.id && selectedBaiThi
          ? [{ 
              id: selectedBaiThi.id, 
              name: `Bài thi #${selectedBaiThi.id}`, 
              type: 'bai_thi' 
            }]
          : undefined,
        formMode: (itemToEdit?.id ? 'edit' : 'add') as 'edit' | 'add',
      };
    }

    // Detail view
    if (view === 'detail' && selectedBaiThi) {
      const employeeName = employeeMap.get(selectedBaiThi.nhan_vien_id) || 'N/A';
      return {
        type: 'detail',
        function: 'Công việc',
        module: 'Bài thi',
        tab: tabLabel,
        items: [{ 
          id: selectedBaiThi.id, 
          name: `Bài thi của ${employeeName}`, 
          type: 'bai_thi' 
        }],
      };
    }

    // Default: list view
    return { 
      type: 'list',
      function: 'Công việc',
      module: 'Bài thi',
      tab: tabLabel,
    };
  }, [
    view,
    activeTab,
    isFormOpen,
    itemToEdit?.id,
    selectedBaiThi?.id,
    selectedBaiThi?.nhan_vien_id,
    employeeMap,
  ]);
}
