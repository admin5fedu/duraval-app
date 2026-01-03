/**
 * useCauHoiState Hook
 * 
 * Hook for state management in CauHoi sub-module
 */

import { useState, useCallback } from 'react';
import useSessionStorage from '@lib/hooks/useSessionStorage';
import { CauHoi } from '@src/types';
import { type CauHoiView } from '@src/types';

export function useCauHoiState() {
  const [view, setView] = useSessionStorage<CauHoiView>('cau-hoi-view', 'list');
  const [selectedId, setSelectedId] = useSessionStorage<number | null>('cau-hoi-selectedId', null);
  const [itemToEdit, setItemToEdit] = useState<Partial<CauHoi> | null>(null);
  // Form modal state (for InlineListTable - child table forms)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEditInModal, setItemToEditInModal] = useState<Partial<CauHoi> | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ items: CauHoi[]; isBulk: boolean } | null>(null);

  const handleViewDetails = useCallback((item: CauHoi) => {
    setSelectedId(item.id);
    setView('detail');
  }, [setSelectedId, setView]);

  // Full page form handlers (from ListView and DetailView)
  const handleAdd = useCallback(() => {
    setItemToEdit(null);
    setView('form');
  }, [setView]);

  const handleEdit = useCallback((item: CauHoi) => {
    setItemToEdit(item);
    setView('form');
  }, [setView]);

  const handleCloseForm = useCallback(() => {
    // If we came from detail view, go back to detail; otherwise go to list
    if (selectedId) {
      setView('detail');
    } else {
      setView('list');
    }
    setItemToEdit(null);
  }, [selectedId, setView]);

  // Modal form handlers (from InlineListTable)
  const handleAddInModal = useCallback(() => {
    setItemToEditInModal(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEditInModal = useCallback((item: CauHoi) => {
    setItemToEditInModal(item);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setItemToEditInModal(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedId(null);
    setView('list');
  }, [setSelectedId, setView]);

  const handleDelete = useCallback((item: CauHoi | CauHoi[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    setDeleteModal({ items: itemsArray, isBulk: itemsArray.length > 1 });
  }, []);

  return {
    // State
    view,
    setView,
    selectedId,
    setSelectedId,
    itemToEdit,
    setItemToEdit,
    isFormModalOpen,
    setIsFormModalOpen,
    itemToEditInModal,
    setItemToEditInModal,
    deleteModal,
    setDeleteModal,
    
    // Actions
    handleViewDetails,
    handleAdd,
    handleEdit,
    handleCloseForm,
    handleAddInModal,
    handleEditInModal,
    handleCloseFormModal,
    handleBackToList,
    handleDelete,
  };
}

