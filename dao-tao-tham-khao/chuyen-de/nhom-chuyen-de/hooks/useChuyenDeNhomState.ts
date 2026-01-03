/**
 * useChuyenDeNhomState Hook
 * 
 * Hook for state management in ChuyenDeNhom sub-module
 */

import { useState, useCallback } from 'react';
import useSessionStorage from '@lib/hooks/useSessionStorage';
import { ChuyenDeNhom } from '@src/types';
import { type ChuyenDeNhomView } from '@src/types';

export function useChuyenDeNhomState() {
  const [view, setView] = useSessionStorage<ChuyenDeNhomView>('chuyen-de-nhom-view', 'list');
  const [selectedId, setSelectedId] = useSessionStorage<number | null>('chuyen-de-nhom-selectedId', null);
  const [itemToEdit, setItemToEdit] = useState<Partial<ChuyenDeNhom> | null>(null);
  // Form modal state (for InlineListTable - child table forms)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEditInModal, setItemToEditInModal] = useState<Partial<ChuyenDeNhom> | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ items: ChuyenDeNhom[]; isBulk: boolean } | null>(null);

  const handleViewDetails = useCallback((item: ChuyenDeNhom) => {
    setSelectedId(item.id);
    setView('detail');
  }, [setSelectedId, setView]);

  // Full page form handlers (from ListView and DetailView)
  const handleAdd = useCallback(() => {
    setItemToEdit(null);
    setView('form');
  }, [setView]);

  const handleEdit = useCallback((item: ChuyenDeNhom) => {
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

  const handleEditInModal = useCallback((item: ChuyenDeNhom) => {
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

  const handleDelete = useCallback((item: ChuyenDeNhom | ChuyenDeNhom[]) => {
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

