/**
 * BaiThiInlineView Component
 * 
 * Inline view component for displaying answer details (chi tiết câu trả lời) 
 * within a test attempt detail view (bài thi làm).
 * 
 * Note: Currently, BaiThiDetailView displays answer details in sections rather than 
 * an inline table. This component is prepared for future use cases where inline 
 * table display might be needed.
 * 
 * Uses BaseInlineView foundation component for read-only display.
 * 
 * @example
 * ```tsx
 * // Future use case - if needed to display answers in table format
 * <BaiThiInlineView
 *   answers={chiTietBaiLam}
 *   questionMap={questionMap}
 * />
 * ```
 */

import React from 'react';
import { type CauHoi } from '@src/types';
import { formatDate } from '@components/shared/utils/formatters';
import Badge from '@components/ui/feedback/Badge';
import { BaseInlineView, type InlineViewColumn } from '@components/foundation/views';
import { useInlineView } from '@lib/hooks/foundation/useInlineView';
import { type BaiThiInlineViewProps, type ChiTietBaiLam } from '@src/types';

const BaiThiInlineView: React.FC<BaiThiInlineViewProps> = ({
  answers,
  questionMap,
  onView,
}) => {
  // Memoize callbacks to prevent re-creation
  const handleView = React.useCallback((answer: ChiTietBaiLam) => {
    if (onView) {
      onView(answer);
    }
  }, [onView]);

  // Use BaseInlineView hook (read-only, no CRUD)
  const inlineView = useInlineView<ChiTietBaiLam>({
    items: answers,
    skipDeleteConfirmation: true, // No delete functionality
  });

  // Columns definition - memoize to prevent re-creation
  const columns: InlineViewColumn<ChiTietBaiLam>[] = React.useMemo(() => [
    {
      key: 'cau_hoi',
      label: 'Câu hỏi',
      render: (answer: ChiTietBaiLam) => {
        const question = questionMap.get(answer.cau_hoi_id);
        return (
          <span className="font-medium text-text-primary dark:text-white">
            {question?.cau_hoi || `Câu hỏi ID: ${answer.cau_hoi_id}`}
          </span>
        );
      },
    },
    {
      key: 'dap_an_da_chon',
      label: 'Đáp án đã chọn',
      render: (answer: ChiTietBaiLam) => {
        const question = questionMap.get(answer.cau_hoi_id);
        if (!question) return 'N/A';
        
        const answerTexts = {
          1: question.dap_an_1,
          2: question.dap_an_2,
          3: question.dap_an_3,
          4: question.dap_an_4,
        };
        
        const chosenText = answerTexts[answer.dap_an_da_chon as keyof typeof answerTexts] || 'N/A';
        const isCorrect = answer.dap_an_da_chon === question.dap_an_dung;
        
        return (
          <span className={isCorrect ? 'text-success' : 'text-danger'}>
            {chosenText}
          </span>
        );
      },
    },
    {
      key: 'ket_qua',
      label: 'Kết quả',
      render: (answer: ChiTietBaiLam) => {
        const question = questionMap.get(answer.cau_hoi_id);
        const isCorrect = question && answer.dap_an_da_chon === question.dap_an_dung;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isCorrect 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
          }`}>
            {isCorrect ? 'Đúng' : 'Sai'}
          </span>
        );
      },
    },
  ], [questionMap]);

  return (
    <BaseInlineView
      title={`Chi tiết câu trả lời (${answers.length})`}
      items={answers}
      columns={columns}
      {...inlineView}
      handleView={onView ? handleView : undefined}
      emptyMessage="Chưa có câu trả lời nào."
    />
  );
};

export default BaiThiInlineView;

