/**
 * ChuyenDeDetailView Component
 * 
 * Detail view for ChuyenDe sub-module using CauHoiInlineView
 */

import React from 'react';
import { type ChuyenDe, type CauHoi, type ChuyenDeNhom } from '@src/types';
import { formatDate } from '@components/shared/utils/formatters';
import { BaseDetailView } from '@components/foundation/views';
import { DetailSection, DetailRow } from '@components/ui/data-display/detail';
import CauHoiInlineView from './CauHoiInlineView';

interface ChuyenDeDetailViewProps {
  item: ChuyenDe;
  groupName: string;
  creatorName: string;
  questions: CauHoi[];
  topicList: ChuyenDe[];
  groupList: ChuyenDeNhom[];
  employeeMap: Map<number, string>;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddQuestion?: () => void;
  onSaveQuestion?: (item: Partial<CauHoi>) => Promise<void>;
  onDeleteQuestion?: (question: CauHoi) => Promise<void>;
  onViewQuestionDetails?: (questionId: number) => void;
}

const ChuyenDeDetailView: React.FC<ChuyenDeDetailViewProps> = ({ 
  item, 
  groupName, 
  creatorName, 
  questions,
  topicList,
  groupList,
  employeeMap,
  onBack, 
  onEdit, 
  onDelete,
  onSaveQuestion,
  onDeleteQuestion,
  onViewQuestionDetails,
}) => {
  return (
    <BaseDetailView
      item={item}
      title={item.ten_chuyen_de}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
      maxWidth="6xl"
      deleteConfirmMessage={`Bạn có chắc muốn xóa chuyên đề "${item.ten_chuyen_de}"? Thao tác này sẽ xóa tất cả câu hỏi thuộc chuyên đề này.`}
    >
      <DetailSection title="Thông tin chuyên đề">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="Tên chuyên đề" value={<span className="font-semibold">{item.ten_chuyen_de}</span>} />
          <DetailRow label="Thuộc nhóm" value={groupName} />
          <DetailRow label="Ghi chú" value={item.ghi_chu || '---'} className="md:col-span-2" />
          <DetailRow label="Người tạo" value={creatorName} />
          <DetailRow label="Ngày tạo" value={formatDate(item.created_at)} />
        </div>
      </DetailSection>

      <div className="mt-8">
        <CauHoiInlineView
          questions={questions}
          topicId={item.id}
          topicList={topicList}
          groupList={groupList}
          onSave={onSaveQuestion}
          onDelete={onDeleteQuestion}
          onView={onViewQuestionDetails}
        />
      </div>
    </BaseDetailView>
  );
};

export default ChuyenDeDetailView;

