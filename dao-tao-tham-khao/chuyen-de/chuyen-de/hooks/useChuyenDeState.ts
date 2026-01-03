/**
 * useChuyenDeState Hook
 * 
 * Hook for state management in ChuyenDe sub-module
 */

import { useState, useCallback } from 'react';
import useSessionStorage from '@lib/hooks/useSessionStorage';
import { ChuyenDe } from '@src/types';
import { type ChuyenDeView } from '@src/types';

export function useChuyenDeState() {
  const [view, setView] = useSessionStorage<ChuyenDeView>('chuyen-de-view', 'list');
  const [selectedId, setSelectedId] = useSessionStorage<number | null>('chuyen-de-selectedId', null);
  const [itemToEdit, setItemToEdit] = useState<Partial<ChuyenDe> | null>(null);
  // Form modal state (for InlineListTable - child table forms)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEditInModal, setItemToEditInModal] = useState<Partial<ChuyenDe> | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ items: ChuyenDe[]; isBulk: boolean } | null>(null);

  const handleViewDetails = useCallback((item: ChuyenDe) => {
    setSelectedId(item.id);
    setView('detail');
  }, [setSelectedId, setView]);

  // Full page form handlers (from ListView and DetailView)
  const handleAdd = useCallback(() => {
    setItemToEdit(null);
    setView('form');
  }, [setView]);

  const handleEdit = useCallback((item: ChuyenDe) => {
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

  const handleEditInModal = useCallback((item: ChuyenDe) => {
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

  const handleDelete = useCallback((item: ChuyenDe | ChuyenDe[]) => {
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

