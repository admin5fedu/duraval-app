/**
 * ChuyenDeNhomListView Component
 * 
 * List view for ChuyenDeNhom sub-module using Foundation Components
 */

import { ColumnDefinition } from '@components/business/filters/ColumnPickerDropdown';
import BaseFilterDropdown from '@components/foundation/forms/BaseFilterDropdown';
import { BaseListView } from '@components/foundation/views';
import { formatDate } from '@components/shared/utils/formatters';
import { CardField, StandardListViewCard } from '@components/templates';
import { useListView } from '@lib/hooks/foundation/useListView';
import { exportToExcelCustom } from '@lib/utils/foundation/exportUtils';
import { type ChuyenDeNhom, type GroupStats } from '@src/types';
import React from 'react';
import * as XLSX from 'xlsx';
import {
    GROUP_COLUMN_DEFINITIONS,
    GROUP_COLUMN_WIDTHS,
    GROUP_SORT_OPTIONS,
    getGroupSearchableFields,
    getGroupSortValue,
} from '../utils/chuyenDeNhomHelpers';

interface ChuyenDeNhomListViewProps {
  items: ChuyenDeNhom[];
  employeeMap: Map<number, string>;
  stats?: Record<number, GroupStats>;
  onBack: () => void;
  onAdd?: () => void;
  onEdit?: (item: ChuyenDeNhom) => void;
  onDelete?: (item: ChuyenDeNhom | ChuyenDeNhom[]) => void;
  onView?: (item: ChuyenDeNhom) => void;
  onImport?: (items: Partial<ChuyenDeNhom>[]) => void;
  onRefresh?: () => Promise<void>;
}

const ChuyenDeNhomListView: React.FC<ChuyenDeNhomListViewProps> = ({
  items,
  employeeMap,
  stats,
  onBack,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onImport,
  onRefresh,
}) => {
  // Custom sort value extractor
  const customSortValue = (item: ChuyenDeNhom, sortKey: string): any => {
    return getGroupSortValue(item, sortKey, stats);
  };

  // Custom filter function
  const customFilter = (item: ChuyenDeNhom, filters: Record<string, any>): boolean => {
    if (filters.nguoi_tao_id && filters.nguoi_tao_id !== 'All' && String(item.nguoi_tao_id) !== filters.nguoi_tao_id) {
      return false;
    }
    return true;
  };

  // Use Foundation useListView hook
  const listView = useListView({
    items,
    columns: GROUP_COLUMN_DEFINITIONS,
    sortOptions: GROUP_SORT_OPTIONS,
    defaultSort: { key: 'created_at', direction: 'desc' },
    storageKey: 'chuyen-de-nhom-list',
    searchableFields: getGroupSearchableFields,
    customFilter,
    customSortValue,
    defaultVisibleColumns: new Set(['ten_nhom', 'topic_count', 'question_count', 'nguoi_tao_id', 'created_at']),
    defaultPinnedColumns: new Set(['ten_nhom']),
  });

  // Render cell content
  const renderCell = (item: ChuyenDeNhom, column: ColumnDefinition): React.ReactNode => {
    switch (column.key) {
      case 'ten_nhom':
        return <span className="font-medium text-text-primary dark:text-white">{item.ten_nhom}</span>;
      case 'topic_count':
        return stats?.[item.id]?.topicCount ?? 0;
      case 'question_count':
        return stats?.[item.id]?.questionCount ?? 0;
      case 'nguoi_tao_id':
        return employeeMap.get(item.nguoi_tao_id) || 'N/A';
      case 'created_at':
        return formatDate(item.created_at);
      default:
        return '—';
    }
  };

  // Get mobile card fields
  const getMobileCardFields = (item: ChuyenDeNhom): CardField[] => {
    return [
      { label: 'Số chuyên đề', value: stats?.[item.id]?.topicCount ?? 0, condition: true },
      { label: 'Số câu hỏi', value: stats?.[item.id]?.questionCount ?? 0, condition: true },
      { label: 'Người tạo', value: employeeMap.get(item.nguoi_tao_id) || 'N/A', condition: true },
      { label: 'Ngày tạo', value: formatDate(item.created_at), condition: true },
    ];
  };

  // Render mobile card
  const renderMobileCard = (item: ChuyenDeNhom) => {
    return (
      <StandardListViewCard
        key={item.id}
        title={item.ten_nhom}
        onView={onView ? () => onView(item) : undefined}
        fields={getMobileCardFields(item)}
        onEdit={onEdit ? () => onEdit(item) : undefined}
        onDelete={onDelete ? () => onDelete(item) : undefined}
      />
    );
  };

  // Filter content
  const uniqueCreators = React.useMemo(() => {
    const creatorSet = new Set<number>();
    items.forEach(item => {
      if (item.nguoi_tao_id) creatorSet.add(item.nguoi_tao_id);
    });
    return Array.from(creatorSet).map(id => ({
      value: String(id),
      label: employeeMap.get(id) || 'N/A',
    }));
  }, [items, employeeMap]);

  const filterContent = (
    <div className="space-y-4">
      <BaseFilterDropdown
        label="Người tạo"
        value={listView.filters.nguoi_tao_id}
        onChange={(value) => listView.setFilters(prev => ({
          ...prev,
          nguoi_tao_id: value,
        }))}
        options={uniqueCreators}
        allLabel="Tất cả người tạo"
      />
    </div>
  );

  // Export handler
  const handleExport = (selectedOnly: boolean) => {
    const itemsToExport = selectedOnly
      ? listView.getSelectedItems()
      : listView.filteredItems;

    exportToExcelCustom(
      itemsToExport,
      (item) => ({
        'Tên nhóm': item.ten_nhom,
        'Số chuyên đề': stats?.[item.id]?.topicCount ?? 0,
        'Số câu hỏi': stats?.[item.id]?.questionCount ?? 0,
        'Người tạo': employeeMap.get(item.nguoi_tao_id) || 'N/A',
        'Ngày tạo': formatDate(item.created_at),
      }),
      { filename: `Nhom_Chuyen_De_${selectedOnly ? '_selected' : ''}` },
      selectedOnly
    );
  };

  // Import handler
  const handleImport = (file: File) => {
    if (!onImport) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        onImport(jsonData as Partial<ChuyenDeNhom>[]);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <BaseListView
      {...listView}
      columns={GROUP_COLUMN_DEFINITIONS}
      sortOptions={GROUP_SORT_OPTIONS}
      onBack={onBack}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      onImport={handleImport}
      onExport={handleExport}
      renderCell={renderCell}
      renderMobileCard={renderMobileCard}
      getMobileCardFields={getMobileCardFields}
      filterContent={filterContent}
      columnWidths={GROUP_COLUMN_WIDTHS}
      emptyTitle="Chưa có nhóm nào"
      emptyMessage="Hãy bắt đầu bằng cách tạo một nhóm mới."
    />
  );
};

export default ChuyenDeNhomListView;

