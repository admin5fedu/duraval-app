/**
 * useKyThiBreadcrumbViewState Hook
 * 
 * Derives breadcrumb view state from router state
 * Separated for better testability and reusability
 */

import { type BreadcrumbViewState } from '@lib/breadcrumb';
import { type BaiThiLam, type KyThi } from '@src/types';
import { useMemo } from 'react';
import { getKyThiTabLabel } from '../utils/kyThiHelpers';

interface UseKyThiBreadcrumbViewStateParams {
  view: 'list' | 'detail' | 'form' | 'test' | 'result';
  activeTab: 'all' | 'my';
  itemToEdit?: KyThi | null;
  selectedKyThi?: KyThi | null;
  selectedBaiThi?: BaiThiLam | null; // Thêm selectedBaiThi để hiển thị nested breadcrumb
  currentTest?: BaiThiLam | null;
  finalResult?: BaiThiLam | null;
  kyThiList: KyThi[];
}

/**
 * Derives breadcrumb view state from router state
 * 
 * @param params - Router state parameters
 * @returns BreadcrumbViewState for useBreadcrumb hook
 */
export function useKyThiBreadcrumbViewState({
  view,
  activeTab,
  itemToEdit,
  selectedKyThi,
  selectedBaiThi,
  currentTest,
  finalResult,
  kyThiList,
}: UseKyThiBreadcrumbViewStateParams): BreadcrumbViewState {
  return useMemo(() => {
    const tabLabel = getKyThiTabLabel(activeTab);

    // Form view
    if (view === 'form') {
      const formMode: 'edit' | 'add' = itemToEdit?.id ? 'edit' : 'add';
      return {
        type: 'form',
        tab: tabLabel,
        items: itemToEdit?.id && selectedKyThi
          ? [{ 
              id: selectedKyThi.id, 
              name: selectedKyThi.ten_ky_thi, 
              type: 'ky_thi' 
            }]
          : undefined,
        formMode,
      };
    }

    // Detail view - hiển thị nested breadcrumb nếu có selectedBaiThi
    if (view === 'detail' && selectedKyThi) {
      if (selectedBaiThi) {
        // Hiển thị nested path: Kỳ thi > Bài thi
        // Sử dụng format ngày thi và ID để tạo label cho bài thi
        const baiThiLabel = selectedBaiThi.ngay_lam_bai 
          ? `Bài thi ${new Date(selectedBaiThi.ngay_lam_bai).toLocaleDateString('vi-VN')}`
          : `Bài thi #${selectedBaiThi.id}`;
        return {
          type: 'detail',
          tab: tabLabel,
          items: [
            { 
              id: selectedKyThi.id, 
              name: selectedKyThi.ten_ky_thi, 
              type: 'ky_thi' 
            },
            {
              id: selectedBaiThi.id,
              name: baiThiLabel,
              type: 'bai_thi'
            }
          ],
        };
      }
      // Không có selectedBaiThi, chỉ hiển thị kỳ thi
      return {
        type: 'detail',
        tab: tabLabel,
        items: [{ 
          id: selectedKyThi.id, 
          name: selectedKyThi.ten_ky_thi, 
          type: 'ky_thi' 
        }],
      };
    }

    // Test view (nested detail)
    if (view === 'test' && currentTest) {
      const kyThi = kyThiList.find(k => k.id === currentTest.ky_thi_id);
      if (kyThi) {
        return {
          type: 'detail',
          tab: tabLabel,
          items: [
            { id: kyThi.id, name: kyThi.ten_ky_thi, type: 'ky_thi' },
            { id: currentTest.id, name: 'Làm bài thi', type: 'test' }
          ],
        };
      }
    }

    // Result view (nested detail)
    if (view === 'result' && finalResult) {
      const kyThi = kyThiList.find(k => k.id === finalResult.ky_thi_id);
      if (kyThi) {
        return {
          type: 'detail',
          tab: tabLabel,
          items: [
            { id: kyThi.id, name: kyThi.ten_ky_thi, type: 'ky_thi' },
            { id: finalResult.id, name: 'Kết quả', type: 'result' }
          ],
        };
      }
    }

    // Default: list view
    return { 
      type: 'list', 
      tab: tabLabel 
    };
  }, [
    view, 
    activeTab, 
    itemToEdit?.id, 
    selectedKyThi?.id, 
    selectedKyThi?.ten_ky_thi,
    selectedBaiThi?.id, // Thêm dependency
    selectedBaiThi?.ngay_lam_bai, // Thêm dependency
    currentTest?.id, 
    currentTest?.ky_thi_id, 
    finalResult?.id, 
    finalResult?.ky_thi_id, 
    kyThiList
  ]);
}
