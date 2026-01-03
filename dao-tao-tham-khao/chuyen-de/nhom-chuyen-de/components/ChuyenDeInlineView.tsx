/**
 * ChuyenDeInlineView Component
 * 
 * Inline view component for displaying and managing topics (chuyên đề) 
 * within a group detail view (nhóm chuyên đề).
 * 
 * Uses BaseInlineView foundation component with integrated form modal.
 * 
 * @example
 * ```tsx
 * <ChuyenDeInlineView
 *   topics={topics}
 *   groupId={group.id}
 *   groupList={groupList}
 *   onSave={handleSaveTopic}
 *   onDelete={handleDeleteTopic}
 *   onView={handleViewTopicDetails}
 * />
 * ```
 */

import React from 'react';
import { type ChuyenDe, type ChuyenDeNhom } from '@src/types';
import { BaseInlineView, type InlineViewColumn } from '@components/foundation/views';
import { useInlineView } from '@lib/hooks/foundation/useInlineView';
import { formatDate } from '@components/shared/utils/formatters';
import { useAuth } from '@lib/contexts/AuthContext';
import { getMaNhanVien, validateUser } from '@lib/utils/formDataHelpers';

// Lazy load ChuyenDeFormView outside component to avoid re-creation
const ChuyenDeFormView = React.lazy(() => import('../../chuyen-de/components/ChuyenDeFormView'));

// Wrapper form component for BaseInlineView
const ChuyenDeInlineForm: React.FC<{
  item?: ChuyenDe | null;
  onSave: (item: Partial<ChuyenDe>) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  groupList: ChuyenDeNhom[];
  initialGroupId?: number;
}> = React.memo(({ item, onSave, onClose, groupList, initialGroupId }) => {
  const { currentUser } = useAuth();
  
  const handleSave = React.useCallback(async (data: Partial<ChuyenDe>) => {
    if (!item?.id) {
      // Sử dụng ma_nhan_vien khi tạo mới
      const maNhanVien = getMaNhanVien(currentUser);
      if (!maNhanVien) {
        validateUser(currentUser, 'thêm chuyên đề');
        return;
      }
      await onSave({
        ...data,
        nhom_id: initialGroupId || data.nhom_id || 0,
        nguoi_tao_id: maNhanVien,
      });
    } else {
      await onSave({
        ...data,
        nhom_id: initialGroupId || data.nhom_id || 0,
        id: item.id,
      });
    }
  }, [onSave, initialGroupId, item?.id, currentUser]);

  const itemToEdit = React.useMemo(() => {
    return item || (initialGroupId ? { nhom_id: initialGroupId } : null);
  }, [item, initialGroupId]);

  return (
    <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
      <ChuyenDeFormView
        onBack={onClose}
        onSave={handleSave}
        itemToEdit={itemToEdit}
        groupList={groupList}
      />
    </React.Suspense>
  );
});

ChuyenDeInlineForm.displayName = 'ChuyenDeInlineForm';

export interface ChuyenDeInlineViewProps {
  topics: ChuyenDe[];
  groupId: number;
  groupList: ChuyenDeNhom[];
  onSave?: (item: Partial<ChuyenDe>) => Promise<void>;
  onDelete?: (topic: ChuyenDe) => Promise<void>;
  onView?: (topicId: number) => void;
}

const ChuyenDeInlineView: React.FC<ChuyenDeInlineViewProps> = ({
  topics,
  groupId,
  groupList,
  onSave,
  onDelete,
  onView,
}) => {
  // Memoize callbacks to prevent re-creation
  const handleViewTopic = React.useCallback((topic: ChuyenDe) => {
    if (onView) {
      onView(topic.id);
    }
  }, [onView]);

  // Use BaseInlineView hook
  const inlineView = useInlineView<ChuyenDe>({
    items: topics,
    onSave,
    onDelete,
    onView: onView ? handleViewTopic : undefined,
    skipDeleteConfirmation: false, // Use built-in confirmation modal
  });

  // Columns definition - memoize to prevent re-creation
  const columns: InlineViewColumn<ChuyenDe>[] = React.useMemo(() => [
    {
      key: 'ten_chuyen_de',
      label: 'Tên chuyên đề',
      render: (topic) => (
        <span className="font-medium text-text-primary dark:text-white">
          {topic.ten_chuyen_de}
        </span>
      ),
    },
    {
      key: 'ghi_chu',
      label: 'Ghi chú',
      render: (topic) => (
        <span className="text-text-secondary dark:text-gray-400 line-clamp-1">
          {topic.ghi_chu || '---'}
        </span>
      ),
      className: 'hidden md:table-cell',
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (topic) => (
        <span className="text-text-secondary dark:text-gray-400 text-sm">
          {formatDate(topic.created_at)}
        </span>
      ),
      className: 'hidden lg:table-cell',
    },
  ], []);

  // Memoize form component to prevent re-creation
  const formComponent = React.useCallback((props: {
    item?: ChuyenDe | null;
    onSave: (item: Partial<ChuyenDe>) => Promise<void>;
    onClose: () => void;
    isSubmitting?: boolean;
  }) => (
    <ChuyenDeInlineForm
      {...props}
      groupList={groupList}
      initialGroupId={groupId}
    />
  ), [groupList, groupId]);

  return (
    <BaseInlineView
      title={`Các chuyên đề trong nhóm (${topics.length})`}
      items={topics}
      columns={columns}
      {...inlineView}
      formComponent={formComponent}
      addLabel="Thêm chuyên đề"
      emptyMessage="Chưa có chuyên đề nào trong nhóm này."
    />
  );
};

export default ChuyenDeInlineView;

