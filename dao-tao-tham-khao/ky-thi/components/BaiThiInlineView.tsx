/**
 * BaiThiInlineView Component
 * 
 * Inline view component for displaying test attempts (bài thi làm) 
 * within a test period detail view (kỳ thi).
 * 
 * Uses BaseInlineView foundation component for read-only display.
 * Note: This is a read-only view, no CRUD operations are provided.
 * 
 * @example
 * ```tsx
 * <BaiThiInlineView
 *   attempts={attempts}
 *   employeeMap={employeeMap}
 *   onView={handleViewBaiThiDetails}
 * />
 * ```
 */

import { BaseInlineView, type InlineViewColumn } from '@components/foundation/views';
import { formatDate } from '@components/shared/utils/formatters';
import Badge from '@components/ui/feedback/Badge';
import { useAuth } from '@lib/contexts/AuthContext';
import { useInlineView } from '@lib/hooks/foundation/useInlineView';
import { type BaiThiInlineViewProps, type BaiThiLam } from '@src/types';
import React from 'react';
import { filterBaiThiByPermission } from '../../bai-thi/utils/baiThiHelpers';
import { useKyThiPermissionGuards } from '../utils/kyThiPermissions';

const BaiThiInlineView: React.FC<BaiThiInlineViewProps> = ({
  attempts,
  employeeMap,
  onView,
}) => {
  const { currentUser, enhancedEmployees, chucVu, capChucDanh } = useAuth();
  const guards = useKyThiPermissionGuards();
  
  // Filter attempts based on permissions
  const filteredAttempts = React.useMemo(() => {
    if (!currentUser) return [];
    return filterBaiThiByPermission(
      attempts,
      currentUser,
      enhancedEmployees,
      chucVu,
      capChucDanh,
      guards.canAccessAll()
    );
  }, [attempts, currentUser, enhancedEmployees, chucVu, capChucDanh, guards]);

  // Memoize callbacks to prevent re-creation
  const handleView = React.useCallback((attempt: BaiThiLam) => {
    if (onView) {
      onView(attempt);
    }
  }, [onView]);

  // Use BaseInlineView hook (read-only, no CRUD)
  const inlineView = useInlineView<BaiThiLam>({
    items: filteredAttempts,
    skipDeleteConfirmation: true, // No delete functionality
  });

  // Columns definition - memoize to prevent re-creation
  const columns: InlineViewColumn<BaiThiLam>[] = React.useMemo(() => [
    {
      key: 'nhan_vien',
      label: 'Nhân viên',
      render: (attempt: BaiThiLam) => (
        <span className="font-medium text-text-primary dark:text-white">
          {employeeMap.get(attempt.nhan_vien_id)?.ho_ten || 'Không rõ'}
        </span>
      ),
    },
    {
      key: 'ngay_lam_bai',
      label: 'Ngày thi',
      render: (attempt: BaiThiLam) => (
        <span className="text-text-secondary dark:text-gray-400">
          {formatDate(attempt.ngay_lam_bai)}
        </span>
      ),
      className: 'hidden sm:table-cell',
    },
    {
      key: 'diem',
      label: 'Điểm số',
      render: (attempt: BaiThiLam) => {
        const percentage = attempt.tong_so_cau > 0 
          ? (attempt.diem_so / attempt.tong_so_cau) * 100 
          : 0;
        const isPassed = attempt.trang_thai === 'Đạt';
        const isFailed = attempt.trang_thai === 'Không đạt';
        return (
          <div className="flex flex-col gap-1">
            <span className={`font-semibold ${isPassed ? 'text-success' : isFailed ? 'text-danger' : ''}`}>
              {attempt.diem_so}/{attempt.tong_so_cau}
            </span>
            <span className="text-xs text-text-secondary dark:text-gray-400">
              ({percentage.toFixed(0)}%)
            </span>
          </div>
        );
      },
    },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      render: (attempt: BaiThiLam) => <Badge text={attempt.trang_thai} />,
    },
    {
      key: 'thoi_gian',
      label: 'Thời gian làm bài',
      render: (attempt: BaiThiLam) => {
        if (!attempt.thoi_gian_bat_dau || !attempt.thoi_gian_ket_thuc) {
          return <span className="text-text-secondary dark:text-gray-400 text-sm">---</span>;
        }
        const start = new Date(attempt.thoi_gian_bat_dau);
        const end = new Date(attempt.thoi_gian_ket_thuc);
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        return (
          <span className="text-text-secondary dark:text-gray-400 text-sm">
            {diffMins > 0 ? `${diffMins} phút` : ''} {diffSecs > 0 ? `${diffSecs} giây` : ''}
          </span>
        );
      },
      className: 'hidden lg:table-cell',
    },
  ], [employeeMap]);

  return (
    <BaseInlineView
      title={`Danh sách các lượt thi (${filteredAttempts.length})`}
      items={filteredAttempts}
      columns={columns}
      {...inlineView}
      handleView={onView ? handleView : undefined}
      emptyMessage="Chưa có lượt thi nào."
    />
  );
};

export default BaiThiInlineView;

