/**
 * ChuyenDeNhomDetailView Component
 * 
 * Detail view for ChuyenDeNhom sub-module using ChuyenDeInlineView
 */

import React from 'react';
import { type ChuyenDe, type ChuyenDeNhom } from '@src/types';
import { formatDate } from '@components/shared/utils/formatters';
import { BaseDetailView } from '@components/foundation/views';
import { DetailSection, DetailRow } from '@components/ui/data-display/detail';
import ChuyenDeInlineView from './ChuyenDeInlineView';

interface ChuyenDeNhomDetailViewProps {
  item: ChuyenDeNhom;
  topics: ChuyenDe[];
  employeeMap: Map<number, string>;
  groupList: ChuyenDeNhom[];
  onBack: () => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onAddTopic?: (groupId: number) => void;
  onSaveTopic?: (item: Partial<ChuyenDe>) => Promise<void>;
  onDeleteTopic?: (topic: ChuyenDe) => Promise<void>;
  onViewTopicDetails?: (topicId: number) => void;
}

const ChuyenDeNhomDetailView: React.FC<ChuyenDeNhomDetailViewProps> = ({
  item,
  topics,
  employeeMap,
  groupList,
  onBack,
  onEditGroup,
  onDeleteGroup,
  onSaveTopic,
  onDeleteTopic,
  onViewTopicDetails,
}) => {
  return (
    <BaseDetailView
      item={item}
      title={item.ten_nhom}
      onBack={onBack}
      onEdit={onEditGroup}
      onDelete={onDeleteGroup}
      maxWidth="6xl"
      deleteConfirmMessage={`Bạn có chắc muốn xóa nhóm "${item.ten_nhom}"? Hành động này sẽ xóa cả các chuyên đề và câu hỏi bên trong.`}
    >
      <DetailSection title="Thông tin nhóm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="Người tạo" value={employeeMap.get(item.nguoi_tao_id) || 'N/A'} />
          <DetailRow label="Ngày tạo" value={formatDate(item.created_at)} />
        </div>
      </DetailSection>

      <div className="mt-8">
        <ChuyenDeInlineView
          topics={topics}
          groupId={item.id}
          groupList={groupList}
          onSave={onSaveTopic}
          onDelete={onDeleteTopic}
          onView={onViewTopicDetails}
        />
      </div>
    </BaseDetailView>
  );
};

export default ChuyenDeNhomDetailView;

