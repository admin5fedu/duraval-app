/**
 * ChuyenDeListView Component
 * 
 * List view for ChuyenDe sub-module using Foundation Components
 */

import React from 'react';
import * as XLSX from 'xlsx';
import { type ChuyenDe, type ChuyenDeNhom } from '@src/types';
import { ColumnDefinition } from '@components/business/filters/ColumnPickerDropdown';
import { BaseListView } from '@components/foundation/views';
import { useListView } from '@lib/hooks/foundation/useListView';
import { formatDate } from '@components/shared/utils/formatters';
import { exportToExcelCustom } from '@lib/utils/foundation/exportUtils';
import { StandardListViewCard, CardField } from '@components/templates';
import BaseFilterDropdown from '@components/foundation/forms/BaseFilterDropdown';
import {
  TOPIC_COLUMN_DEFINITIONS,
  TOPIC_SORT_OPTIONS,
  TOPIC_COLUMN_WIDTHS,
  getTopicSearchableFields,
  getTopicSortValue,
} from '../utils/chuyenDeHelpers';
import { type EnhancedTopic } from '@src/types';

interface ChuyenDeListViewProps {
  items: EnhancedTopic[];
  groupList: ChuyenDeNhom[];
  employeeMap: Map<number, string>;
  onBack: () => void;
  onAdd?: () => void;
  onEdit?: (item: ChuyenDe) => void;
  onDelete?: (item: ChuyenDe | ChuyenDe[]) => void;
  onView?: (item: ChuyenDe) => void;
  onImport?: (items: Partial<ChuyenDe>[]) => void;
}

const ChuyenDeListView: React.FC<ChuyenDeListViewProps> = ({
  items,
  groupList,
  employeeMap,
  onBack,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onImport,
}) => {
  /**
   * Custom sort value extractor for topics
   * Uses helper function to get sortable value from EnhancedTopic
   */
  const customSortValue = (item: EnhancedTopic, sortKey: string): any => {
    return getTopicSortValue(item, sortKey);
  };

  /**
   * Custom filter function for topics
   * Filters by nhom_id (group) and nguoi_tao_id (creator)
   */
  const customFilter = (item: EnhancedTopic, filters: Record<string, any>): boolean => {
    if (filters.nhom_id && filters.nhom_id !== 'All' && String(item.nhom_id) !== filters.nhom_id) {
      return false;
    }
    if (filters.nguoi_tao_id && filters.nguoi_tao_id !== 'All' && String(item.nguoi_tao_id) !== filters.nguoi_tao_id) {
      return false;
    }
    return true;
  };

  const listView = useListView({
    items,
    columns: TOPIC_COLUMN_DEFINITIONS,
    sortOptions: TOPIC_SORT_OPTIONS,
    defaultSort: { key: 'created_at', direction: 'desc' },
    storageKey: 'chuyen-de-list',
    searchableFields: getTopicSearchableFields,
    customFilter,
    customSortValue,
    defaultVisibleColumns: new Set(['ten_chuyen_de', 'groupName', 'questionCount', 'nguoi_tao_id', 'created_at']),
    defaultPinnedColumns: new Set(['ten_chuyen_de']),
  });

  /**
   * Render cell content for table columns
   */
  const renderCell = (item: EnhancedTopic, column: ColumnDefinition): React.ReactNode => {
    switch (column.key) {
      case 'ten_chuyen_de':
        return <span className="font-medium text-text-primary dark:text-white">{item.ten_chuyen_de}</span>;
      case 'groupName':
        return item.groupName;
      case 'questionCount':
        return item.questionCount;
      case 'nguoi_tao_id':
        return employeeMap.get(item.nguoi_tao_id) || 'N/A';
      case 'created_at':
        return formatDate(item.created_at);
      default:
        return '—';
    }
  };

  /**
   * Get fields to display in mobile card view
   */
  const getMobileCardFields = (item: EnhancedTopic): CardField[] => {
    return [
      { label: 'Nhóm', value: item.groupName, condition: true },
      { label: 'Số câu hỏi', value: item.questionCount, condition: true },
      { label: 'Người tạo', value: employeeMap.get(item.nguoi_tao_id) || 'N/A', condition: true },
      { label: 'Ngày tạo', value: formatDate(item.created_at), condition: true },
    ];
  };

  /**
   * Render mobile card for responsive view
   */
  const renderMobileCard = (item: EnhancedTopic) => {
    return (
      <StandardListViewCard
        key={item.id}
        title={item.ten_chuyen_de}
        onView={onView ? () => onView(item) : undefined}
        fields={getMobileCardFields(item)}
        onEdit={onEdit ? () => onEdit(item) : undefined}
        onDelete={onDelete ? () => onDelete(item) : undefined}
      />
    );
  };

  /**
   * Get unique creators for filter dropdown
   * Extracts unique creator IDs from items and maps to employee names
   */
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
        label="Nhóm"
        value={listView.filters.nhom_id}
        onChange={(value) => listView.setFilters(prev => ({
          ...prev,
          nhom_id: value,
        }))}
        options={groupList.map(group => ({
          value: String(group.id),
          label: group.ten_nhom,
        }))}
        allLabel="Tất cả nhóm"
      />
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

  /**
   * Export handler for Excel export
   * @param selectedOnly - If true, export only selected items; otherwise export all filtered items
   */
  const handleExport = (selectedOnly: boolean) => {
    const itemsToExport = selectedOnly
      ? listView.getSelectedItems()
      : listView.filteredItems;

    exportToExcelCustom(
      itemsToExport,
      (item) => ({
        'Tên chuyên đề': item.ten_chuyen_de,
        'Nhóm': item.groupName,
        'Số câu hỏi': item.questionCount,
        'Người tạo': employeeMap.get(item.nguoi_tao_id) || 'N/A',
        'Ngày tạo': formatDate(item.created_at),
      }),
      { filename: `Chuyen_De_${selectedOnly ? '_selected' : ''}` },
      selectedOnly
    );
  };

  /**
   * Import handler for Excel import
   * Reads Excel file and converts to JSON data
   */
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
        onImport(jsonData as Partial<ChuyenDe>[]);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <BaseListView
      {...listView}
      columns={TOPIC_COLUMN_DEFINITIONS}
      sortOptions={TOPIC_SORT_OPTIONS}
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
      columnWidths={TOPIC_COLUMN_WIDTHS}
      emptyTitle="Chưa có chuyên đề nào"
      emptyMessage="Hãy bắt đầu bằng cách tạo một chuyên đề mới."
    />
  );
};

export default ChuyenDeListView;

