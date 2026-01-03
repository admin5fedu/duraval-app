/**
 * BaiThiDetailView Component
 * 
 * Detail view for BaiThi module using BaseDetailView foundation component
 */

import React, { useMemo, useState } from 'react';
import { type BaiThiLam, type DanhGia, type CauHoi, type Employee, type KyThi } from '@src/types';
import { CheckCircleIcon, XCircleIcon } from '@src/assets/icons';
import { formatDate } from '@components/shared/utils/formatters';
import Badge from '@components/ui/feedback/Badge';
import { BaseDetailView, DetailSection, DetailRow } from '@components/foundation/views';
import { formatDuration, calculatePercentage } from '../utils/baiThiHelpers';
import { useAuth } from '@lib/contexts/AuthContext';
import { getMaNhanVien, validateUser } from '@lib/utils/formDataHelpers';

interface BaiThiDetailViewProps {
  item: BaiThiLam;
  onBack: () => void;
  onSaveDanhGia: (baiThiId: number, danhGia: DanhGia | null) => void;
  onDelete: (items: BaiThiLam[]) => void;
  employeeMap: Map<number, string>;
  kyThiMap: Map<number, string>;
  questionList: CauHoi[];
}

const AnswerOption: React.FC<{ text: string, isCorrect: boolean, isChosen: boolean }> = ({ text, isCorrect, isChosen }) => {
  const baseClasses = "flex items-start gap-3 p-3 rounded-md border text-sm";
  let statusClasses = "border-primary dark:border-gray-600";
  if (isChosen && isCorrect) {
    statusClasses = "border-success bg-green-50 dark:bg-green-500/10";
  } else if (isChosen && !isCorrect) {
    statusClasses = "border-danger bg-red-50 dark:bg-red-500/10";
  } else if (isCorrect) {
    statusClasses = "border-success bg-green-50 dark:bg-green-500/10";
  }

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      {isCorrect ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-success" /> 
                 : (isChosen ? <XCircleIcon className="w-5 h-5 flex-shrink-0 text-danger" /> 
                             : <div className="w-5 h-5 flex-shrink-0"></div>)}
      <p>{text}</p>
    </div>
  );
};

const BaiThiDetailView: React.FC<BaiThiDetailViewProps> = ({ 
  item, 
  onBack, 
  onSaveDanhGia,
  onDelete,
  employeeMap,
  kyThiMap,
  questionList,
}) => {
  const { currentUser } = useAuth();
  const [isEditingDanhGia, setIsEditingDanhGia] = useState(false);
  const [noiDungDanhGia, setNoiDungDanhGia] = useState(item.danh_gia?.noi_dung || '');
  
  const employeeName = employeeMap.get(item.nhan_vien_id) || 'N/A';
  const kyThiName = kyThiMap.get(item.ky_thi_id) || 'N/A';
  const questionMap = useMemo(() => new Map(questionList.map(q => [q.id, q])), [questionList]);

  const duration = useMemo(() => {
    return formatDuration(item.thoi_gian_bat_dau, item.thoi_gian_ket_thuc);
  }, [item.thoi_gian_bat_dau, item.thoi_gian_ket_thuc]);
  
  const percentage = calculatePercentage(item.diem_so, item.tong_so_cau);
  const evaluatorName = item.danh_gia 
    ? employeeMap.get(item.danh_gia.nguoi_danh_gia_id) || 'Không rõ'
    : null;

  const handleSave = () => {
    if (!noiDungDanhGia.trim()) return;
    
    // Sử dụng ma_nhan_vien thay vì id
    const maNhanVien = getMaNhanVien(currentUser);
    if (!maNhanVien) {
      validateUser(currentUser, 'đánh giá bài thi');
      return;
    }
    
    const newDanhGia: DanhGia = {
      nguoi_danh_gia_id: maNhanVien,
      noi_dung: noiDungDanhGia,
      ngay_danh_gia: new Date().toISOString(),
    };
    onSaveDanhGia(item.id, newDanhGia);
    setIsEditingDanhGia(false);
  };

  const handleCancelEdit = () => {
    setNoiDungDanhGia(item.danh_gia?.noi_dung || '');
    setIsEditingDanhGia(false);
  };

  return (
    <BaseDetailView
      item={item}
      title={`Chi tiết bài thi của ${employeeName}`}
      onBack={onBack}
      onDelete={() => onDelete([item])}
      maxWidth="6xl"
    >
      <DetailSection title={kyThiName || 'Thông tin bài thi'}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailRow label="Nhân viên" value={employeeName} />
          <DetailRow label="Ngày thi" value={formatDate(item.ngay_lam_bai)} />
          <DetailRow label="Thời gian làm bài" value={duration} />
          <DetailRow label="Điểm số" value={
            <div className="flex items-baseline gap-2">
              <span>{item.diem_so}/{item.tong_so_cau}</span>
              <span className="text-sm font-normal text-text-secondary">({percentage.toFixed(0)}%)</span>
            </div>
          }/>
          <DetailRow label="Trạng thái" value={<Badge text={item.trang_thai} />} />
        </div>
      </DetailSection>

      <DetailSection title="Chi tiết câu trả lời">
        <div className="space-y-6">
          {item.chi_tiet_bai_lam.map((answer, index) => {
            const question = questionMap.get(answer.cau_hoi_id);
            if (!question) return <div key={index}>Câu hỏi ID: {answer.cau_hoi_id} không tìm thấy.</div>;
            
            const options = [
              { text: question.dap_an_1, index: 1 },
              { text: question.dap_an_2, index: 2 },
              { text: question.dap_an_3, index: 3 },
              { text: question.dap_an_4, index: 4 },
            ];

            return (
              <div key={question.id} className="pb-4 border-b border-primary dark:border-gray-700 last:border-b-0">
                <p className="font-semibold mb-3">Câu {index + 1}: {question.cau_hoi}</p>
                <div className="space-y-2">
                  {options.map(opt => (
                    <AnswerOption 
                      key={opt.index}
                      text={opt.text}
                      isCorrect={question.dap_an_dung === opt.index}
                      isChosen={answer.dap_an_da_chon === opt.index}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DetailSection>
              
      <DetailSection title="Đánh giá của quản lý">
        {item.danh_gia && !isEditingDanhGia ? (
          <div className="bg-primary/50 dark:bg-gray-700/30 rounded-lg p-4">
            <p className="text-sm whitespace-pre-wrap">{item.danh_gia.noi_dung}</p>
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-text-secondary">
                - {evaluatorName} vào {formatDate(item.danh_gia.ngay_danh_gia)}
              </p>
              <button 
                onClick={() => setIsEditingDanhGia(true)} 
                className="px-3 py-1 text-sm bg-accent/20 text-accent rounded hover:bg-accent/30"
              >
                Sửa
              </button>
            </div>
          </div>
        ) : (
          <div>
            <textarea 
              rows={4}
              value={noiDungDanhGia}
              onChange={e => setNoiDungDanhGia(e.target.value)}
              placeholder="Nhập nội dung đánh giá..."
              className="w-full px-3 py-2 bg-background dark:bg-[#111827] border border-gray-300 dark:border-[#374151] rounded-md"
            />
            <div className="text-right mt-2 space-x-2">
              {isEditingDanhGia && (
                <button 
                  onClick={handleCancelEdit} 
                  className="px-4 py-2 bg-primary dark:bg-gray-600 rounded-md"
                >
                  Hủy
                </button>
              )}
              <button 
                onClick={handleSave} 
                disabled={!noiDungDanhGia.trim()} 
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50"
              >
                Lưu đánh giá
              </button>
            </div>
          </div>
        )}
      </DetailSection>
    </BaseDetailView>
  );
};

export default BaiThiDetailView;

