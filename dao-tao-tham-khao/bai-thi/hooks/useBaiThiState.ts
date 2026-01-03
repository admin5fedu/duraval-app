/**
 * useBaiThiState Hook
 * 
 * Hook for state management in BaiThi module
 */

import { useState, useCallback } from 'react';
import useSessionStorage from '@lib/hooks/useSessionStorage';
import { type BaiThiLam } from '@src/types';
import { type BaiThiFilters } from '@components/shared/hooks/useBaiThiTableFilter';
import { type BaiThiView, type BaiThiTab, type DeleteModalState } from '@src/types';

export function useBaiThiState() {
  const [view, setView] = useSessionStorage<BaiThiView>('bai-thi-view', 'list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useSessionStorage<BaiThiTab>('bai-thi-activeTab', 'all');
  const [selectedBaiThi, setSelectedBaiThi] = useSessionStorage<BaiThiLam | null>('bai-thi-selectedItem', null);
  const [itemToEdit, setItemToEdit] = useState<Partial<BaiThiLam> | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);
  const [initialFilter, setInitialFilter] = useState<Partial<BaiThiFilters> | null>(null);
  const [detailOrigin, setDetailOrigin] = useState<string | null>(null);

  const handleViewDetails = useCallback((item: BaiThiLam, origin?: string) => {
    setSelectedBaiThi(item);
    setDetailOrigin(origin || null);
    setView('detail');
  }, [setSelectedBaiThi, setView]);

  const handleAdd = useCallback(() => {
    setItemToEdit(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: BaiThiLam) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setItemToEdit(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setView('list');
    setSelectedBaiThi(null);
    setItemToEdit(null);
    setIsFormOpen(false);
    setDetailOrigin(null);
  }, [setView, setSelectedBaiThi]);

  const handleDelete = useCallback((item: BaiThiLam | BaiThiLam[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    setDeleteModal({
      items: itemsArray,
      isBulk: itemsArray.length > 1,
    });
  }, []);

  return {
    // State
    view,
    setView,
    isFormOpen,
    setIsFormOpen,
    activeTab,
    setActiveTab,
    selectedBaiThi,
    setSelectedBaiThi,
    itemToEdit,
    setItemToEdit,
    deleteModal,
    setDeleteModal,
    initialFilter,
    setInitialFilter,
    detailOrigin,
    setDetailOrigin,
    
    // Handlers
    handleViewDetails,
    handleAdd,
    handleEdit,
    handleCloseForm,
    handleBackToList,
    handleDelete,
  };
}

