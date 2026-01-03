/**
 * CauHoiListView Component
 * 
 * List view for CauHoi sub-module using Foundation Components
 */

import { ColumnDefinition } from '@components/business/filters/ColumnPickerDropdown';
import BaseFilterDropdown from '@components/foundation/forms/BaseFilterDropdown';
import { BaseListView } from '@components/foundation/views';
import { formatDate } from '@components/shared/utils/formatters';
import { CardField, StandardListViewCard } from '@components/templates';
import { useListView } from '@lib/hooks/foundation/useListView';
import { exportToExcelCustom } from '@lib/utils/foundation/exportUtils';
import { type CauHoi, type ChuyenDe, type EnhancedQuestion } from '@src/types';
import React from 'react';
import * as XLSX from 'xlsx';
import {
    QUESTION_COLUMN_DEFINITIONS,
    QUESTION_COLUMN_WIDTHS,
    QUESTION_SORT_OPTIONS,
    getQuestionSearchableFields,
    getQuestionSortValue,
} from '../utils/cauHoiHelpers';

interface CauHoiListViewProps {
  items: EnhancedQuestion[];
  topicList: ChuyenDe[];
  employeeMap: Map<number, string>;
  onBack: () => void;
  onAdd?: () => void;
  onEdit?: (item: CauHoi) => void;
  onDelete?: (item: CauHoi | CauHoi[]) => void;
  onView?: (item: CauHoi) => void;
  onImport?: (items: Partial<CauHoi>[]) => void;
}

const CauHoiListView: React.FC<CauHoiListViewProps> = ({
  items,
  topicList,
  employeeMap,
  onBack,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onImport,
}) => {
  /**
   * Custom sort value extractor for questions
   * Uses helper function to get sortable value from EnhancedQuestion
   */
  const customSortValue = (item: EnhancedQuestion, sortKey: string): any => {
    return getQuestionSortValue(item, sortKey);
  };

  /**
   * Custom filter function for questions
   * Filters by chuyen_de_id (topic) and nguoi_tao_id (creator)
   */
  const customFilter = (item: EnhancedQuestion, filters: Record<string, any>): boolean => {
    if (filters.chuyen_de_id && filters.chuyen_de_id !== 'All' && String(item.chuyen_de_id) !== filters.chuyen_de_id) {
      return false;
    }
    if (filters.nguoi_tao_id && filters.nguoi_tao_id !== 'All' && String(item.nguoi_tao_id) !== filters.nguoi_tao_id) {
      return false;
    }
    return true;
  };

  const listView = useListView({
    items,
    columns: QUESTION_COLUMN_DEFINITIONS,
    sortOptions: QUESTION_SORT_OPTIONS,
    defaultSort: { key: 'created_at', direction: 'desc' },
    storageKey: 'cau-hoi-list',
    searchableFields: getQuestionSearchableFields,
    customFilter,
    customSortValue,
    defaultVisibleColumns: new Set(['cau_hoi', 'topicName', 'dap_an_dung', 'nguoi_tao_id', 'created_at']),
    defaultPinnedColumns: new Set(['cau_hoi']),
  });

  /**
   * Render cell content for table columns
   */
  const renderCell = (item: EnhancedQuestion, column: ColumnDefinition): React.ReactNode => {
    switch (column.key) {
      case 'cau_hoi':
        return (
          <span 
            className="font-medium text-text-primary dark:text-white truncate block" 
            title={item.cau_hoi}
            style={{ maxWidth: '400px' }}
          >
            {item.cau_hoi}
          </span>
        );
      case 'topicName':
        return item.topicName;
      case 'dap_an_dung':
        const answerTexts = {
          1: item.dap_an_1,
          2: item.dap_an_2,
          3: item.dap_an_3,
          4: item.dap_an_4,
        };
        const correctAnswer = answerTexts[item.dap_an_dung];
        return (
          <span className="text-text-secondary dark:text-gray-400">
            <span className="font-semibold text-success mr-1">✓</span>
            <span className="line-clamp-1">{correctAnswer}</span>
          </span>
        );
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
  const getMobileCardFields = (item: EnhancedQuestion): CardField[] => {
    return [
      { label: 'Chuyên đề', value: item.topicName, condition: true },
      { label: 'Đáp án đúng', value: `Đáp án ${item.dap_an_dung}`, condition: true },
      { label: 'Người tạo', value: employeeMap.get(item.nguoi_tao_id) || 'N/A', condition: true },
      { label: 'Ngày tạo', value: formatDate(item.created_at), condition: true },
    ];
  };

  /**
   * Render mobile card for responsive view
   */
  const renderMobileCard = (item: EnhancedQuestion) => {
    return (
      <StandardListViewCard
        key={item.id}
        title={item.cau_hoi}
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
        label="Chuyên đề"
        value={listView.filters.chuyen_de_id}
        onChange={(value) => listView.setFilters(prev => ({
          ...prev,
          chuyen_de_id: value,
        }))}
        options={topicList.map(topic => ({
          value: String(topic.id),
          label: topic.ten_chuyen_de,
        }))}
        allLabel="Tất cả chuyên đề"
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
        'Câu hỏi': item.cau_hoi,
        'Chuyên đề': item.topicName,
        'Đáp án 1': item.dap_an_1,
        'Đáp án 2': item.dap_an_2,
        'Đáp án 3': item.dap_an_3,
        'Đáp án 4': item.dap_an_4,
        'Đáp án đúng': `Đáp án ${item.dap_an_dung}`,
      }),
      { filename: `Cau_Hoi_${selectedOnly ? '_selected' : ''}` },
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
        onImport(jsonData as Partial<CauHoi>[]);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <BaseListView
      {...listView}
      columns={QUESTION_COLUMN_DEFINITIONS}
      sortOptions={QUESTION_SORT_OPTIONS}
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
      columnWidths={QUESTION_COLUMN_WIDTHS}
      emptyTitle="Chưa có câu hỏi nào"
      emptyMessage="Hãy bắt đầu bằng cách tạo một câu hỏi mới."
    />
  );
};

export default CauHoiListView;

