/**
 * BaiThiListView Component
 * 
 * List view for BaiThi module using BaseListView foundation component
 */

import React, { useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { type BaiThiLam } from '@src/types';
import { UsersIcon, UserCircleIcon } from '@src/assets/icons';
import Badge from '@components/ui/feedback/Badge';
import { formatDate } from '@components/shared/utils/formatters';
import { BaseListView } from '@components/foundation/views';
import { useListView } from '@lib/hooks/foundation/useListView';
import { SortOption, ColumnDefinition } from '@components/templates';
import TabsGroup from '@components/ui/navigation/TabsGroup';
import { type BaiThiFilters, type BaiThiLamEnhanced } from '@components/shared/hooks/useBaiThiTableFilter';
import { calculatePercentage } from '../utils/baiThiHelpers';

interface BaiThiListViewProps {
  items: BaiThiLamEnhanced[];
  kyThiList: { id: number; ten_ky_thi: string }[];
  employeeMap: Map<number, string>;
  onAdd: () => void;
  onEdit: (item: BaiThiLam) => void;
  onDelete: (item: BaiThiLam | BaiThiLam[]) => void;
  onViewDetails: (item: BaiThiLam) => void;
  onBack?: () => void;
  onRefresh?: () => Promise<void> | void;
  activeTab: 'all' | 'my';
  onTabChange: (tab: 'all' | 'my') => void;
  initialFilter?: Partial<BaiThiFilters> | null;
  clearInitialFilter: () => void;
  myBaiThiCount: number;
  allBaiThiCount: number;
}

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { key: 'ky_thi', label: 'Kỳ thi' },
  { key: 'nhan_vien', label: 'Nhân viên' },
  { key: 'ngay_thi', label: 'Ngày thi' },
  { key: 'trang_thai', label: 'Trạng thái' },
  { key: 'diem', label: 'Điểm' },
  { key: 'danh_gia', label: 'Đánh giá' },
];

const SORT_OPTIONS: SortOption[] = [
  { key: 'ky_thi', label: 'Kỳ thi' },
  { key: 'nhan_vien', label: 'Nhân viên' },
  { key: 'ngay_thi', label: 'Ngày thi' },
  { key: 'trang_thai', label: 'Trạng thái' },
  { key: 'diem', label: 'Điểm' },
  { key: 'danh_gia', label: 'Đánh giá' },
];

const COLUMN_WIDTHS: Record<string, number> = {
  ky_thi: 220,
  nhan_vien: 200,
  ngay_thi: 160,
  trang_thai: 150,
  diem: 150,
  danh_gia: 150,
};

const BaiThiListView: React.FC<BaiThiListViewProps> = ({
  items,
  kyThiList,
  employeeMap,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onBack,
  onRefresh,
  activeTab,
  onTabChange,
  initialFilter,
  clearInitialFilter,
  myBaiThiCount,
  allBaiThiCount,
}) => {
  // Clear initial filter after first render
  useEffect(() => {
    if (initialFilter) {
      clearInitialFilter();
    }
  }, [initialFilter, clearInitialFilter]);

  // Get unique status options for filter
  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      if (item.trang_thai) set.add(item.trang_thai);
    });
    return Array.from(set);
  }, [items]);

  // Use BaseListView hook
  const listView = useListView<BaiThiLamEnhanced>({
    items,
    columns: COLUMN_DEFINITIONS,
    sortOptions: SORT_OPTIONS,
    defaultSort: { key: 'ngay_thi', direction: 'desc' },
    storageKey: 'bai-thi-list',
    searchableFields: (item) => [
      item.kyThiName,
      item.nhanVienName,
      item.trang_thai,
      String(item.diem_so),
    ],
    customFilter: (item, filters) => {
      if (filters.ky_thi_id && filters.ky_thi_id !== 'All' && String(item.ky_thi_id) !== filters.ky_thi_id) {
        return false;
      }
      if (filters.trang_thai && filters.trang_thai !== 'All' && item.trang_thai !== filters.trang_thai) {
        return false;
      }
      return true;
    },
    customSortValue: (item, sortKey) => {
      switch (sortKey) {
        case 'ky_thi':
          return item.kyThiName || '';
        case 'nhan_vien':
          return item.nhanVienName || '';
        case 'ngay_thi':
          return new Date(item.ngay_lam_bai || '').getTime();
        case 'trang_thai':
          return item.trang_thai || '';
        case 'diem':
          return item.tong_so_cau > 0 ? item.diem_so / item.tong_so_cau : 0;
        case 'danh_gia':
          return item.danh_gia ? 1 : 0;
        default:
          return '';
      }
    },
    defaultVisibleColumns: new Set(['ky_thi', 'nhan_vien', 'ngay_thi', 'trang_thai', 'diem', 'danh_gia']),
    defaultPinnedColumns: new Set(['ky_thi']),
  });

  // Apply initial filter if provided
  useEffect(() => {
    if (initialFilter) {
      const newFilters: Record<string, any> = {};
      if (initialFilter.ky_thi_id) newFilters.ky_thi_id = initialFilter.ky_thi_id;
      if (initialFilter.trang_thai) newFilters.trang_thai = initialFilter.trang_thai;
      if (initialFilter.search) newFilters.search = initialFilter.search;
      if (Object.keys(newFilters).length > 0) {
        listView.setFilters(prev => ({ ...prev, ...newFilters }));
      }
    }
  }, [initialFilter, listView]);

  // Custom render cell
  const renderCell = (item: BaiThiLamEnhanced, column: ColumnDefinition) => {
    switch (column.key) {
      case 'ky_thi':
        return <span className="font-medium text-text-primary dark:text-white">{item.kyThiName}</span>;
      case 'nhan_vien':
        return <span className="text-text-primary dark:text-white">{item.nhanVienName}</span>;
      case 'ngay_thi':
        return <span className="text-text-secondary dark:text-[#9CA3AF]">{formatDate(item.ngay_lam_bai)}</span>;
      case 'trang_thai':
        return <Badge text={item.trang_thai} />;
      case 'diem':
        const percentage = calculatePercentage(item.diem_so, item.tong_so_cau);
        return (
          <span className="font-semibold">
            {item.diem_so}/{item.tong_so_cau}{' '}
            <span className="text-text-secondary text-xs">({percentage.toFixed(0)}%)</span>
          </span>
        );
      case 'danh_gia':
        return item.danh_gia ? <Badge text="Đã đánh giá" /> : <Badge text="Chưa đánh giá" />;
      default:
        return '—';
    }
  };

  // Mobile card fields
  const getMobileCardFields = (item: BaiThiLamEnhanced) => [
    { label: 'Nhân viên', value: item.nhanVienName, condition: !!item.nhanVienName },
    { label: 'Ngày thi', value: formatDate(item.ngay_lam_bai), condition: !!item.ngay_lam_bai },
    { 
      label: 'Điểm', 
      value: `${item.diem_so}/${item.tong_so_cau} (${calculatePercentage(item.diem_so, item.tong_so_cau).toFixed(0)}%)`, 
      condition: true 
    },
    { label: 'Đánh giá', value: item.danh_gia ? <Badge text="Đã đánh giá" /> : <Badge text="Chưa đánh giá" />, condition: true },
  ];

  // Filter content
  const filterContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Kỳ thi</label>
        <select
          value={listView.filters.ky_thi_id || 'All'}
          onChange={(e) => listView.setFilters(prev => ({ ...prev, ky_thi_id: e.target.value === 'All' ? undefined : e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-[#374151] rounded-md bg-background dark:bg-[#111827] text-text-primary dark:text-white"
        >
          <option value="All">Tất cả kỳ thi</option>
          {kyThiList.map(kyThi => (
            <option key={kyThi.id} value={String(kyThi.id)}>{kyThi.ten_ky_thi}</option>
          ))}
        </select>
      </div>
      {statusOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Trạng thái</label>
          <select
            value={listView.filters.trang_thai || 'All'}
            onChange={(e) => listView.setFilters(prev => ({ ...prev, trang_thai: e.target.value === 'All' ? undefined : e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#374151] rounded-md bg-background dark:bg-[#111827] text-text-primary dark:text-white"
          >
            <option value="All">Tất cả trạng thái</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // Export handler
  const handleExport = (selectedOnly: boolean) => {
    const dataSource = selectedOnly
      ? listView.filteredItems.filter(item => listView.selectedItems.has(item.id))
      : listView.filteredItems;

    const dataToExport = dataSource.map(item => {
      const percentage = calculatePercentage(item.diem_so, item.tong_so_cau);
      return {
        'Kỳ thi': item.kyThiName,
        'Nhân viên': item.nhanVienName,
        'Ngày thi': formatDate(item.ngay_lam_bai),
        'Trạng thái': item.trang_thai,
        'Điểm': `${item.diem_so}/${item.tong_so_cau}`,
        'Tỷ lệ (%)': percentage.toFixed(0),
        'Đánh giá': item.danh_gia ? 'Đã đánh giá' : 'Chưa đánh giá',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BaiThi');
    XLSX.writeFile(workbook, `Bai_Thi_${selectedOnly ? 'selected_' : ''}${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <TabsGroup
          tabs={[
            { id: 'all', label: 'Tất cả', icon: UsersIcon, count: allBaiThiCount },
            { id: 'my', label: 'Của tôi', icon: UserCircleIcon, count: myBaiThiCount },
          ]}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
      <BaseListView
        {...listView}
        columns={COLUMN_DEFINITIONS}
        sortOptions={SORT_OPTIONS}
        onBack={onBack || (() => {})}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onViewDetails}
        onRefresh={onRefresh}
        renderCell={renderCell}
        getMobileCardFields={getMobileCardFields}
        filterContent={filterContent}
        onExport={handleExport}
        emptyTitle="Chưa có bài thi"
        emptyMessage="Không có bài thi nào."
        emptyAction={
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
          >
            Thêm bài thi
          </button>
        }
        columnWidths={COLUMN_WIDTHS}
      />
    </div>
  );
};

export default BaiThiListView;

