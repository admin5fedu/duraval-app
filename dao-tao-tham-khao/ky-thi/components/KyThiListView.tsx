/**
 * KyThiListView Component
 * 
 * List view for KyThi module using BaseListView foundation component
 */

import React, { useMemo } from 'react';
import * as XLSX from 'xlsx';
import { type KyThi } from '@src/types';
import { ClipboardListIcon, UserCircleIcon } from '@src/assets/icons';
import Badge from '@components/ui/feedback/Badge';
import { formatDate } from '@components/shared/utils/formatters';
import { BaseListView } from '@components/foundation/views';
import { useListView } from '@lib/hooks/foundation/useListView';
import { SortOption, ColumnDefinition } from '@components/templates';
import TabsGroup from '@components/ui/navigation/TabsGroup';

interface KyThiListViewProps {
  items: (KyThi & { trang_thai_tham_gia: string })[];
  employeeMap: Map<number, string>;
  onAdd: () => void;
  onEdit: (item: KyThi) => void;
  onDelete: (item: KyThi | KyThi[]) => void;
  onViewDetails: (item: KyThi) => void;
  onBack?: () => void;
  onRefresh?: () => Promise<void> | void;
  activeTab: 'all' | 'my';
  onTabChange: (tab: 'all' | 'my') => void;
  getMyStatus: (kyThi: KyThi) => string;
}

type SortKey = 'ngay' | 'ten_ky_thi' | 'trang_thai_tham_gia' | 'trang_thai' | 'nguoi_tao_id';

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { key: 'ngay', label: 'Ngày thi' },
  { key: 'ten_ky_thi', label: 'Tên kỳ thi' },
  { key: 'trang_thai_tham_gia', label: 'Trạng thái tham gia' },
  { key: 'trang_thai', label: 'Trạng thái kỳ thi' },
  { key: 'nguoi_tao_id', label: 'Người tạo' },
];

const SORT_OPTIONS: SortOption[] = [
  { key: 'ngay', label: 'Ngày thi' },
  { key: 'ten_ky_thi', label: 'Tên kỳ thi' },
  { key: 'trang_thai_tham_gia', label: 'Trạng thái tham gia' },
  { key: 'trang_thai', label: 'Trạng thái kỳ thi' },
  { key: 'nguoi_tao_id', label: 'Người tạo' },
];

const COLUMN_WIDTHS: Record<string, number> = {
  ngay: 140,
  ten_ky_thi: 240,
  trang_thai_tham_gia: 180,
  trang_thai: 160,
  nguoi_tao_id: 200,
};

const KyThiListView: React.FC<KyThiListViewProps> = ({
  items,
  employeeMap,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onBack,
  onRefresh,
  activeTab,
  onTabChange,
  getMyStatus,
}) => {
  // Get unique participation options for filter
  const uniqueParticipationOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      const status = getMyStatus(item);
      if (status) set.add(status);
    });
    return Array.from(set);
  }, [items, getMyStatus]);

  // Use BaseListView hook with unique storageKey per tab
  const listView = useListView<KyThi & { trang_thai_tham_gia: string }>({
    items,
    columns: COLUMN_DEFINITIONS,
    sortOptions: SORT_OPTIONS,
    defaultSort: { key: 'ngay', direction: 'desc' },
    storageKey: `ky-thi-list-${activeTab}`,
    searchableFields: (item) => [
      item.ten_ky_thi,
      item.trang_thai,
      item.trang_thai_tham_gia,
      employeeMap.get(item.nguoi_tao_id) || '',
    ],
    customFilter: (item, filters) => {
      if (filters.trang_thai && item.trang_thai !== filters.trang_thai) {
        return false;
      }
      if (filters.participation) {
        const participationStatus = getMyStatus(item);
        if (participationStatus !== filters.participation) {
          return false;
        }
      }
      return true;
    },
    customSortValue: (item, sortKey) => {
      switch (sortKey as SortKey) {
        case 'ngay':
          return new Date(item.ngay || '').getTime();
        case 'ten_ky_thi':
          return item.ten_ky_thi || '';
        case 'trang_thai_tham_gia':
          return getMyStatus(item);
        case 'trang_thai':
          return item.trang_thai || '';
        case 'nguoi_tao_id':
          return employeeMap.get(item.nguoi_tao_id) || '';
        default:
          return '';
      }
    },
    defaultVisibleColumns: new Set(['ngay', 'ten_ky_thi', 'trang_thai_tham_gia', 'trang_thai', 'nguoi_tao_id']),
    defaultPinnedColumns: new Set(['ten_ky_thi']),
  });

  // Custom render cell
  const renderCell = (item: KyThi & { trang_thai_tham_gia: string }, column: ColumnDefinition) => {
    switch (column.key) {
      case 'ngay':
        return <span className="text-text-secondary dark:text-[#9CA3AF]">{formatDate(item.ngay)}</span>;
      case 'ten_ky_thi':
        return <span className="font-medium text-text-primary dark:text-white">{item.ten_ky_thi}</span>;
      case 'trang_thai_tham_gia':
        return <Badge text={item.trang_thai_tham_gia} />;
      case 'trang_thai':
        return <Badge text={item.trang_thai} />;
      case 'nguoi_tao_id':
        return <span className="text-text-secondary dark:text-[#9CA3AF]">{employeeMap.get(item.nguoi_tao_id) || '—'}</span>;
      default:
        return '—';
    }
  };

  // Mobile card fields
  const getMobileCardFields = (item: KyThi & { trang_thai_tham_gia: string }) => [
    { label: 'Ngày thi', value: formatDate(item.ngay), condition: !!item.ngay },
    { label: 'Trạng thái', value: <Badge text={item.trang_thai} />, condition: true },
    { label: 'Trạng thái tham gia', value: <Badge text={item.trang_thai_tham_gia} />, condition: true },
    { label: 'Người tạo', value: employeeMap.get(item.nguoi_tao_id) || 'N/A', condition: true },
  ];

  // Filter content
  const filterContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Trạng thái kỳ thi</label>
        <select
          value={listView.filters.trang_thai || 'All'}
          onChange={(e) => listView.setFilters(prev => ({ ...prev, trang_thai: e.target.value === 'All' ? undefined : e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-[#374151] rounded-md bg-background dark:bg-[#111827] text-text-primary dark:text-white"
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Mở">Mở</option>
          <option value="Đóng">Đóng</option>
        </select>
      </div>
      {uniqueParticipationOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Trạng thái tham gia</label>
          <select
            value={listView.filters.participation || 'All'}
            onChange={(e) => listView.setFilters(prev => ({ ...prev, participation: e.target.value === 'All' ? undefined : e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#374151] rounded-md bg-background dark:bg-[#111827] text-text-primary dark:text-white"
          >
            <option value="All">Tất cả</option>
            {uniqueParticipationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
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

    const dataToExport = dataSource.map(item => ({
      'Tên kỳ thi': item.ten_ky_thi,
      'Ngày thi': formatDate(item.ngay),
      'Trạng thái kỳ thi': item.trang_thai,
      'Trạng thái tham gia': getMyStatus(item),
      'Người tạo': employeeMap.get(item.nguoi_tao_id) || 'N/A',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'KyThi');
    XLSX.writeFile(workbook, `Ky_Thi_${selectedOnly ? 'selected_' : ''}${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <TabsGroup
          tabs={[
            { id: 'all', label: 'Tất cả', icon: ClipboardListIcon },
            { id: 'my', label: 'Của tôi', icon: UserCircleIcon },
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
        emptyTitle="Chưa có kỳ thi"
        emptyMessage="Không có kỳ thi nào."
        emptyAction={
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
          >
            Thêm kỳ thi
          </button>
        }
        columnWidths={COLUMN_WIDTHS}
      />
    </div>
  );
};

export default KyThiListView;

