/**
 * CauHoiDetailView Component
 * 
 * Detail view for CauHoi sub-module
 */

import React from 'react';
import { type CauHoi } from '@src/types';
import { CheckCircleIcon } from '@src/assets/icons';
import { formatDate } from '@components/shared/utils/formatters';
import { BaseDetailView } from '@components/foundation/views';
import { DetailSection, DetailRow } from '@components/ui/data-display/detail';

interface CauHoiDetailViewProps {
  item: CauHoi;
  topicName: string;
  creatorName: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AnswerOption: React.FC<{ text: string, isCorrect: boolean }> = ({ text, isCorrect }) => (
  <div className={`flex items-start gap-3 p-3 rounded-md border ${isCorrect ? 'border-success bg-green-50 dark:bg-green-500/10' : 'border-primary dark:border-gray-600'}`}>
    <CheckCircleIcon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${isCorrect ? 'text-success' : 'text-gray-300 dark:text-gray-500'}`} />
    <p className="text-sm">{text}</p>
  </div>
);

const CauHoiDetailView: React.FC<CauHoiDetailViewProps> = ({ item, topicName, creatorName, onBack, onEdit, onDelete }) => {
  return (
    <BaseDetailView
      item={item}
      title={item.cau_hoi}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
      maxWidth="6xl"
      deleteConfirmMessage="Bạn có chắc muốn xóa câu hỏi này?"
    >
      <DetailSection title="Thông tin câu hỏi">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="Thuộc chuyên đề" value={<span className="font-semibold text-accent">{topicName}</span>} />
          <DetailRow label="Người tạo" value={creatorName} />
          <DetailRow label="Ngày tạo" value={formatDate(item.created_at)} />
        </div>
      </DetailSection>

      <DetailSection title="Nội dung câu hỏi">
        <p className="text-base text-text-primary dark:text-white whitespace-pre-wrap">{item.cau_hoi}</p>
      </DetailSection>
                            
      {item.hinh_anh && item.hinh_anh.length > 0 && (
        <DetailSection title="Hình ảnh đính kèm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {item.hinh_anh.map((img, index) => (
              <a key={index} href={img} target="_blank" rel="noopener noreferrer" className="aspect-square block">
                <img src={img} alt={`Ảnh ${index+1}`} className="w-full h-full object-cover rounded-md border border-primary dark:border-gray-700" />
              </a>
            ))}
          </div>
        </DetailSection>
      )}
                            
      <DetailSection title="Các đáp án">
        <div className="space-y-3">
          <AnswerOption text={item.dap_an_1} isCorrect={item.dap_an_dung === 1} />
          <AnswerOption text={item.dap_an_2} isCorrect={item.dap_an_dung === 2} />
          <AnswerOption text={item.dap_an_3} isCorrect={item.dap_an_dung === 3} />
          <AnswerOption text={item.dap_an_4} isCorrect={item.dap_an_dung === 4} />
        </div>
      </DetailSection>
    </BaseDetailView>
  );
};

export default CauHoiDetailView;

