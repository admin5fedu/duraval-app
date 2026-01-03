/**
 * useKyThiState Hook
 * 
 * Hook for state management in KyThi module
 */

import useSessionStorage from '@lib/hooks/useSessionStorage';
import { BaiThiLam, KyThi, ShuffledQuestion, type KyThiTab, type KyThiView } from '@src/types';
import { useCallback, useState } from 'react';

export function useKyThiState() {
  const [selectedKyThi, setSelectedKyThi] = useSessionStorage<KyThi | null>(
    'ky-thi-selectedItem',
    null
  );
  const [itemToEdit, setItemToEdit] = useState<Partial<KyThi> | null>(null);
  // Form modal state (for inline tables - not currently used but kept for consistency)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEditInModal, setItemToEditInModal] = useState<Partial<KyThi> | null>(null);
  const [view, setView] = useState<KyThiView>('list');
  const [activeTab, setActiveTab] = useState<KyThiTab>('all');
  const [deleteModal, setDeleteModal] = useState<{ items: KyThi[]; isBulk: boolean } | null>(null);
  
  // Test states
  const [currentTest, setCurrentTest] = useState<BaiThiLam | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finalResult, setFinalResult] = useState<BaiThiLam | null>(null);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  // State để track bài thi đã chọn từ detail view (cho breadcrumb nested)
  const [selectedBaiThi, setSelectedBaiThi] = useState<BaiThiLam | null>(null);

  const handleView = useCallback((item: KyThi) => {
    setSelectedKyThi(item);
    setView('detail');
    setSelectedBaiThi(null); // Clear selectedBaiThi khi chuyển sang kỳ thi khác
  }, [setSelectedKyThi]);

  // Full page form handlers (from ListView and DetailView)
  const handleAdd = useCallback(() => {
    setItemToEdit(null);
    setView('form');
  }, []);

  const handleEdit = useCallback((item: KyThi) => {
    setItemToEdit(item);
    setView('form');
  }, []);

  const handleCloseForm = useCallback(() => {
    // If we came from detail view, go back to detail; otherwise go to list
    if (selectedKyThi) {
      setView('detail');
    } else {
      setView('list');
    }
    setItemToEdit(null);
  }, [selectedKyThi]);

  // Modal form handlers (for inline tables - not currently used but kept for consistency)
  const handleAddInModal = useCallback(() => {
    setItemToEditInModal(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEditInModal = useCallback((item: KyThi) => {
    setItemToEditInModal(item);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setItemToEditInModal(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedKyThi(null);
    setSelectedBaiThi(null); // Clear selectedBaiThi khi quay về list
    setView('list');
  }, [setSelectedKyThi]);

  const handleDelete = useCallback((item: KyThi | KyThi[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    setDeleteModal({ items: itemsArray, isBulk: itemsArray.length > 1 });
  }, []);

  const resetTestState = useCallback(() => {
    setCurrentTest(null);
    setShuffledQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeLeft(0);
    setIsTimeWarning(false);
    setFinalResult(null);
  }, []);

  return {
    // State
    view,
    setView,
    selectedKyThi,
    itemToEdit,
    isFormModalOpen,
    itemToEditInModal,
    activeTab,
    setActiveTab,
    deleteModal,
    currentTest,
    shuffledQuestions,
    currentQuestionIndex,
    userAnswers,
    timeLeft,
    finalResult,
    isTimeWarning,
    selectedBaiThi, // Export selectedBaiThi
    
    // Actions
    handleView,
    setSelectedBaiThi, // Export setSelectedBaiThi
    handleAdd,
    handleEdit,
    handleCloseForm,
    handleAddInModal,
    handleEditInModal,
    handleCloseFormModal,
    handleBack,
    handleDelete,
    setDeleteModal,
    setCurrentTest,
    setShuffledQuestions,
    setCurrentQuestionIndex,
    setUserAnswers,
    setTimeLeft,
    setFinalResult,
    setIsTimeWarning,
    resetTestState,
  };
}

