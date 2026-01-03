/**
 * CauHoiInlineView Component
 * 
 * Inline view component for displaying and managing questions (câu hỏi) 
 * within a topic detail view (chuyên đề).
 * 
 * Uses BaseInlineView foundation component with integrated form modal.
 * 
 * @example
 * ```tsx
 * <CauHoiInlineView
 *   questions={questions}
 *   topicId={topic.id}
 *   topicList={topicList}
 *   groupList={groupList}
 *   onSave={handleSaveQuestion}
 *   onDelete={handleDeleteQuestion}
 *   onView={handleViewQuestionDetails}
 * />
 * ```
 */

import React from 'react';
import { type CauHoi, type ChuyenDe, type ChuyenDeNhom } from '@src/types';
import { BaseInlineView, type InlineViewColumn } from '@components/foundation/views';
import { useInlineView } from '@lib/hooks/foundation/useInlineView';
import { formatDate } from '@components/shared/utils/formatters';
import { useAuth } from '@lib/contexts/AuthContext';
import { getMaNhanVien, validateUser } from '@lib/utils/formDataHelpers';

// Lazy load CauHoiFormView outside component to avoid re-creation
const CauHoiFormView = React.lazy(() => import('../../cau-hoi/components/CauHoiFormView'));

// Wrapper form component for BaseInlineView
const CauHoiInlineForm: React.FC<{
  item?: CauHoi | null;
  onSave: (item: Partial<CauHoi>) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  topicList: ChuyenDe[];
  groupList: ChuyenDeNhom[];
  initialTopicId?: number;
}> = React.memo(({ item, onSave, onClose, topicList, groupList, initialTopicId }) => {
  const { currentUser } = useAuth();
  
  const handleSave = React.useCallback(async (data: Partial<CauHoi>) => {
    if (!item?.id) {
      // Sử dụng ma_nhan_vien khi tạo mới
      const maNhanVien = getMaNhanVien(currentUser);
      if (!maNhanVien) {
        validateUser(currentUser, 'thêm câu hỏi');
        return;
      }
      await onSave({
        ...data,
        chuyen_de_id: initialTopicId || data.chuyen_de_id || 0,
        nguoi_tao_id: maNhanVien,
      });
    } else {
      await onSave({
        ...data,
        chuyen_de_id: initialTopicId || data.chuyen_de_id || 0,
        id: item.id,
      });
    }
  }, [onSave, initialTopicId, item?.id, currentUser]);

  const itemToEdit = React.useMemo(() => {
    return item || (initialTopicId ? { chuyen_de_id: initialTopicId } : null);
  }, [item, initialTopicId]);

  return (
    <React.Suspense fallback={<div className="p-4">Đang tải form...</div>}>
      <CauHoiFormView
        onBack={onClose}
        onSave={handleSave}
        itemToEdit={itemToEdit}
        topicList={topicList}
        groupList={groupList}
      />
    </React.Suspense>
  );
});

CauHoiInlineForm.displayName = 'CauHoiInlineForm';

export interface CauHoiInlineViewProps {
  questions: CauHoi[];
  topicId: number;
  topicList: ChuyenDe[];
  groupList: ChuyenDeNhom[];
  onSave?: (item: Partial<CauHoi>) => Promise<void>;
  onDelete?: (question: CauHoi) => Promise<void>;
  onView?: (questionId: number) => void;
}

const CauHoiInlineView: React.FC<CauHoiInlineViewProps> = ({
  questions,
  topicId,
  topicList,
  groupList,
  onSave,
  onDelete,
  onView,
}) => {
  // Memoize callbacks to prevent re-creation
  const handleViewQuestion = React.useCallback((question: CauHoi) => {
    if (onView) {
      onView(question.id);
    }
  }, [onView]);

  // Use BaseInlineView hook
  const inlineView = useInlineView<CauHoi>({
    items: questions,
    onSave,
    onDelete,
    onView: onView ? handleViewQuestion : undefined,
    skipDeleteConfirmation: false, // Use built-in confirmation modal
  });

  // Columns definition - memoize to prevent re-creation
  const columns: InlineViewColumn<CauHoi>[] = React.useMemo(() => [
    {
      key: 'cau_hoi',
      label: 'Nội dung câu hỏi',
      render: (question) => (
        <div className="flex flex-col gap-1">
          <span className="text-text-primary dark:text-white line-clamp-2 font-medium">
            {question.cau_hoi}
          </span>
          {question.hinh_anh && question.hinh_anh.length > 0 && (
            <span className="text-xs text-text-secondary dark:text-gray-400">
              📷 {question.hinh_anh.length} hình ảnh
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dap_an_dung',
      label: 'Đáp án đúng',
      render: (question) => {
        const answerTexts = {
          1: question.dap_an_1,
          2: question.dap_an_2,
          3: question.dap_an_3,
          4: question.dap_an_4,
        };
        const correctAnswer = answerTexts[question.dap_an_dung];
        return (
          <span className="text-text-secondary dark:text-gray-400 line-clamp-1 text-sm">
            <span className="font-semibold text-success mr-1">✓</span>
            {correctAnswer}
          </span>
        );
      },
      className: 'hidden md:table-cell',
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (question) => (
        <span className="text-text-secondary dark:text-gray-400 text-sm">
          {formatDate(question.created_at)}
        </span>
      ),
      className: 'hidden lg:table-cell',
    },
  ], []);

  // Memoize form component to prevent re-creation
  const formComponent = React.useCallback((props: {
    item?: CauHoi | null;
    onSave: (item: Partial<CauHoi>) => Promise<void>;
    onClose: () => void;
    isSubmitting?: boolean;
  }) => (
    <CauHoiInlineForm
      {...props}
      topicList={topicList}
      groupList={groupList}
      initialTopicId={topicId}
    />
  ), [topicList, groupList, topicId]);

  return (
    <BaseInlineView
      title={`Các câu hỏi (${questions.length})`}
      items={questions}
      columns={columns}
      {...inlineView}
      formComponent={formComponent}
      addLabel="Thêm câu hỏi"
      emptyMessage="Chưa có câu hỏi nào trong chuyên đề này."
    />
  );
};

export default CauHoiInlineView;

