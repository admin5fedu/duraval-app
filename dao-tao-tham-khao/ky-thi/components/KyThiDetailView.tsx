/**
 * KyThiDetailView Component
 * 
 * Detail view for KyThi module using BaseDetailView foundation component
 */

import React, { useMemo, useState } from 'react';
import { type KyThi, type Employee, type BaiThiLam } from '@src/types';
import { PencilIcon, UserGroupIcon, UsersMinusIcon, AcademicCapIcon, ExclamationTriangleIcon } from '@src/assets/icons';
import { formatDate } from '@components/shared/utils/formatters';
import Badge from '@components/ui/feedback/Badge';
import { useAuth } from '@lib/contexts/AuthContext';
import NhanSuListModal from '@components/business/forms/employee/NhanSuListModal';
import { type BaiThiFilters } from '@components/shared/hooks/useBaiThiTableFilter';
import { BaseDetailView, DetailSection, DetailRow } from '@components/foundation/views';
import BaiThiInlineView from './BaiThiInlineView';

interface KyThiDetailViewProps {
  item: KyThi;
  onBack: () => void;
  onEdit: (item: KyThi) => void;
  onDelete: (item: KyThi) => void;
  onStartTest: (item: KyThi) => void;
  onContinueTest: (item: BaiThiLam) => void;
  onViewMyTests: (filter: Partial<BaiThiFilters>) => void;
  baiThiLamList: BaiThiLam[];
  onViewBaiThiDetails?: (baiThi: BaiThiLam) => void;
}

const StatRow: React.FC<{ label: string, value: number, icon: React.ReactNode, onClick?: () => void }> = ({ label, value, icon, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className="w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors disabled:cursor-default hover:enabled:bg-primary/50 dark:hover:enabled:bg-white/5"
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </div>
    <span className="text-lg font-bold">{value}</span>
  </button>
);

const KyThiDetailView: React.FC<KyThiDetailViewProps> = ({
  item,
  onBack,
  onEdit,
  onDelete,
  onStartTest,
  onContinueTest,
  onViewMyTests,
  baiThiLamList,
  onViewBaiThiDetails,
}) => {
  const { currentUser, enhancedEmployees: nhanSu } = useAuth();
  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; employees: Employee[] }>({ isOpen: false, title: '', employees: [] });
  
  const employeeMap = useMemo(() => new Map(nhanSu.map(e => [e.id, e])), [nhanSu]);

  const stats = useMemo(() => {
    // chuc_vu_ids lưu ma_chuc_vu (string) từ var_chuc_vu
    const chucVuMaSet = new Set(
      (item.chuc_vu_ids || []).map(id => String(id))
    );

    const participants = nhanSu.filter(nv => {
      if (nv.trang_thai === 'Nghỉ việc') return false;
      // Lấy ma_chuc_vu từ chuc_vu object hoặc từ employee
      const maChucVu = nv.chuc_vu?.ma_chuc_vu || (nv as any).ma_chuc_vu;
      return maChucVu && chucVuMaSet.has(maChucVu);
    });
    const attempts = baiThiLamList.filter(bt => bt.ky_thi_id === item.id);
    const participantIdsWhoTookTest = new Set(attempts.map(a => a.nhan_vien_id));
    
    const participantsWhoTookTest = participants.filter(p => participantIdsWhoTookTest.has(p.id));
    const participantsWhoDidNotTakeTest = participants.filter(p => !participantIdsWhoTookTest.has(p.id));
    
    const passedAttempts = attempts.filter(a => a.trang_thai === 'Đạt');
    const failedAttempts = attempts.filter(a => a.trang_thai === 'Không đạt');

    const passedParticipantIds = new Set(passedAttempts.map(a => a.nhan_vien_id));
    const failedParticipantIds = new Set(failedAttempts.map(a => a.nhan_vien_id));

    const participantsWhoPassed = participants.filter(p => passedParticipantIds.has(p.id));
    const participantsWhoFailed = participants.filter(p => failedParticipantIds.has(p.id) && !passedParticipantIds.has(p.id));

    return {
      participants,
      participantsWhoTookTest,
      participantsWhoDidNotTakeTest,
      participantsWhoPassed,
      participantsWhoFailed,
      attempts
    };
  }, [item, nhanSu, baiThiLamList]);

  const participationRate = stats.participants.length > 0
    ? ((stats.participantsWhoTookTest.length / stats.participants.length) * 100).toFixed(0)
    : 0;

  const passRate = stats.participantsWhoTookTest.length > 0
    ? ((stats.participantsWhoPassed.length / stats.participantsWhoTookTest.length) * 100).toFixed(0)
    : 0;

  const myUnfinishedAttempt = useMemo(() => {
    if (!currentUser) return null;
    return baiThiLamList.find(b => b.ky_thi_id === item.id && b.nhan_vien_id === currentUser.id && (b.trang_thai === 'Chưa thi' || b.trang_thai === 'Đang thi'));
  }, [baiThiLamList, item.id, currentUser]);

  const myAttemptsCount = useMemo(() => {
    if (!currentUser) return 0;
    return baiThiLamList.filter(b => b.ky_thi_id === item.id && b.nhan_vien_id === currentUser.id).length;
  }, [baiThiLamList, item.id, currentUser]);

  const handleViewMyTestsClick = () => {
    onViewMyTests({ ky_thi_id: String(item.id), search: currentUser?.ho_ten });
  };

  const leftActions = (
    <>
      {myAttemptsCount > 0 && (
        <button type="button" onClick={handleViewMyTestsClick} className="px-4 py-2 bg-primary dark:bg-[#374151] rounded-md hover:bg-primary-hover flex items-center gap-2 text-sm">
          Xem các lần thi của tôi
        </button>
      )}
      {myUnfinishedAttempt ? (
        <button type="button" onClick={() => onContinueTest(myUnfinishedAttempt)} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover flex items-center gap-2">
          <PencilIcon className="w-5 h-5"/> Tiếp tục làm bài
        </button>
      ) : item.trang_thai === 'Mở' && (
        <button type="button" onClick={() => onStartTest(item)} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover flex items-center gap-2">
          <PencilIcon className="w-5 h-5"/> Làm bài thi mới
        </button>
      )}
    </>
  );

  return (
    <>
      <BaseDetailView
        item={item}
        title={item.ten_ky_thi}
        onBack={onBack}
        onEdit={() => onEdit(item)}
        onDelete={() => onDelete(item)}
        leftActions={leftActions}
        maxWidth="6xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <DetailSection title="Thông tin kỳ thi">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailRow label="Ngày thi" value={formatDate(item.ngay)} />
                <DetailRow label="Số câu hỏi" value={item.so_cau_hoi} />
                <DetailRow label="Thời gian" value={`${item.so_phut_lam_bai} phút`} />
                <DetailRow label="Trạng thái" value={<Badge text={item.trang_thai} />} />
                {item.ghi_chu && (
                  <DetailRow 
                    label="Ghi chú" 
                    value={<span className="whitespace-pre-wrap">{item.ghi_chu}</span>} 
                    wrapperClassName="md:col-span-4"
                  />
                )}
              </div>
            </DetailSection>
            
            <div className="mt-8">
              <BaiThiInlineView
                attempts={stats.attempts}
                employeeMap={employeeMap}
                onView={onViewBaiThiDetails}
              />
            </div>
          </div>
          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-6">
              <DetailSection title="Thống kê tổng quan">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-primary/50 dark:bg-gray-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{participationRate}%</p>
                    <p className="text-xs text-text-secondary">Tỷ lệ tham gia</p>
                  </div>
                  <div className="p-4 bg-primary/50 dark:bg-gray-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{passRate}%</p>
                    <p className="text-xs text-text-secondary">Tỷ lệ đạt</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <StatRow label="Phải thi" value={stats.participants.length} icon={<UserGroupIcon className="w-5 h-5 text-text-secondary"/>} onClick={() => setModalState({ isOpen: true, title: 'Danh sách nhân sự phải thi', employees: stats.participants })} />
                  <StatRow label="Đã thi" value={stats.participantsWhoTookTest.length} icon={<PencilIcon className="w-5 h-5 text-blue-500"/>} onClick={() => setModalState({ isOpen: true, title: 'Danh sách nhân sự đã thi', employees: stats.participantsWhoTookTest })} />
                  <StatRow label="Chưa thi" value={stats.participantsWhoDidNotTakeTest.length} icon={<UsersMinusIcon className="w-5 h-5 text-yellow-500"/>} onClick={() => setModalState({ isOpen: true, title: 'Danh sách nhân sự chưa thi', employees: stats.participantsWhoDidNotTakeTest })} />
                  <StatRow label="Đạt" value={stats.participantsWhoPassed.length} icon={<AcademicCapIcon className="w-5 h-5 text-success"/>} onClick={() => setModalState({ isOpen: true, title: 'Danh sách nhân sự đạt', employees: stats.participantsWhoPassed })} />
                  <StatRow label="Không đạt" value={stats.participantsWhoFailed.length} icon={<ExclamationTriangleIcon className="w-5 h-5 text-danger"/>} onClick={() => setModalState({ isOpen: true, title: 'Danh sách nhân sự không đạt', employees: stats.participantsWhoFailed })} />
                </div>
              </DetailSection>
            </div>
          </div>
        </div>
      </BaseDetailView>
      <NhanSuListModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, title: '', employees: [] })}
        title={modalState.title}
        employees={modalState.employees}
      />
    </>
  );
};

export default KyThiDetailView;

