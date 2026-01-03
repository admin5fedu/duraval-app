/**
 * useKyThiHandlers Hook
 * 
 * Hook for event handlers in KyThi module
 * Uses TanStack Query mutations directly
 */

import { queryKeys } from '@lib/constants/queryKeys';
import { useAuth } from '@lib/contexts/AuthContext';
import { ToastContext } from '@lib/contexts/ToastContext';
import { useCauHoi, useKyThi } from '@lib/hooks/queries/useTraining';
import { getErrorMessage } from '@lib/utils/errorHandler';
import { getMaNhanVien, validateUser } from '@lib/utils/formDataHelpers';
import { BaiThiLam, KyThi, ShuffledQuestion, type KyThiView } from '@src/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';
import { baiThiService } from '../../bai-thi/services/baiThiService';
import { kyThiService } from '../services/kyThiService';
import { createShuffledQuestions, restoreShuffledQuestions } from '../utils/kyThiHelpers';

export interface UseKyThiHandlersOptions {
  // State setters
  setSelectedKyThi: (item: KyThi | null) => void;
  setShuffledQuestions: (questions: ShuffledQuestion[]) => void;
  setCurrentTest: (test: BaiThiLam | null) => void;
  setUserAnswers: (answers: (number | null)[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setTimeLeft: (time: number) => void;
  setIsTimeWarning: (warning: boolean) => void;
  setView: (view: KyThiView) => void;
  setFinalResult: (result: BaiThiLam | null) => void;
  
  // Callbacks
  onViewBaiThiDetails?: (baiThi: BaiThiLam) => void;
}

export function useKyThiHandlers(options: UseKyThiHandlersOptions) {
  const { addToast } = useContext(ToastContext);
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  // Fetch data for handlers
  const { data: kyThiList = [] } = useKyThi();
  const { data: questionList = [] } = useCauHoi();
  
  const {
    setSelectedKyThi,
    setShuffledQuestions,
    setCurrentTest,
    setUserAnswers,
    setCurrentQuestionIndex,
    setTimeLeft,
    setIsTimeWarning,
    setView,
    setFinalResult,
    onViewBaiThiDetails,
  } = options;

  // Mutations - tự định nghĩa với retry logic và error handling
  const addKyThiMutation = useMutation({
    mutationFn: (item: Partial<KyThi>) => kyThiService.createKyThi(item),
    retry: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyThi });
      queryClient.setQueryData(queryKeys.kyThiById(data.id), data);
      addToast({
        message: 'Thêm kỳ thi thành công!',
        type: 'success',
      });
    },
    onError: (error) => {
      addToast({
        message: `Lỗi thêm kỳ thi: ${getErrorMessage(error)}`,
        type: 'error',
      });
    },
  });

  const updateKyThiMutation = useMutation({
    mutationFn: (item: Partial<KyThi> & { id: number }) => kyThiService.updateKyThi(item),
    retry: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyThi });
      queryClient.setQueryData(queryKeys.kyThiById(data.id), data);
      addToast({
        message: 'Cập nhật kỳ thi thành công!',
        type: 'success',
      });
    },
    onError: (error) => {
      addToast({
        message: `Lỗi cập nhật kỳ thi: ${getErrorMessage(error)}`,
        type: 'error',
      });
    },
  });

  const deleteKyThiMutation = useMutation({
    mutationFn: (ids: number[]) => kyThiService.deleteKyThi(ids),
    retry: 3,
    retryDelay: 1000,
    onSuccess: (_, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyThi });
      queryClient.invalidateQueries({ queryKey: queryKeys.baiThiLam });
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: queryKeys.kyThiById(id) });
      });
      addToast({
        message: `Xóa ${deletedIds.length} kỳ thi thành công!`,
        type: 'success',
      });
    },
    onError: (error) => {
      addToast({
        message: `Lỗi xóa kỳ thi: ${getErrorMessage(error)}`,
        type: 'error',
      });
    },
  });

  const addBaiThiMutation = useMutation({
    mutationFn: (item: Partial<BaiThiLam>) => baiThiService.createBaiThiLam(item),
    retry: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baiThiLam });
      queryClient.invalidateQueries({ queryKey: queryKeys.baiThiLamByKyThi(data.ky_thi_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.baiThiLamByEmployee(data.nhan_vien_id) });
      queryClient.setQueryData(queryKeys.baiThiLamById(data.id), data);
    },
    onError: (error) => {
      addToast({
        message: `Lỗi tạo bài thi: ${getErrorMessage(error)}`,
        type: 'error',
      });
    },
  });

  const updateBaiThiMutation = useMutation({
    mutationFn: (item: Partial<BaiThiLam> & { id: number }) => baiThiService.updateBaiThiLam(item),
    retry: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baiThiLam });
      queryClient.invalidateQueries({ queryKey: queryKeys.baiThiLamByKyThi(data.ky_thi_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.baiThiLamByEmployee(data.nhan_vien_id) });
      queryClient.setQueryData(queryKeys.baiThiLamById(data.id), data);
    },
    onError: (error) => {
      addToast({
        message: `Lỗi cập nhật bài thi: ${getErrorMessage(error)}`,
        type: 'error',
      });
    },
  });

  const handleSave = useCallback(async (item: Partial<KyThi>): Promise<KyThi | null> => {
    try {
      if (item.id) {
        return await updateKyThiMutation.mutateAsync(item as Partial<KyThi> & { id: number });
      } else {
        // Sử dụng ma_nhan_vien thay vì id
        const maNhanVien = getMaNhanVien(currentUser);
        if (!maNhanVien) {
          validateUser(currentUser, 'thêm kỳ thi');
          return null;
        }
        return await addKyThiMutation.mutateAsync({ ...item, nguoi_tao_id: maNhanVien });
      }
    } catch (error) {
      throw error;
    }
  }, [addKyThiMutation, updateKyThiMutation, currentUser]);

  const handleDelete = useCallback(async (items: KyThi[]): Promise<boolean> => {
    try {
      const ids = items.map(item => item.id);
      await deleteKyThiMutation.mutateAsync(ids);
      return true;
    } catch (error) {
      throw error;
    }
  }, [deleteKyThiMutation]);

  const handleStartTest = useCallback(async (kyThi: KyThi) => {
    try {
      const maNhanVien = getMaNhanVien(currentUser);
      if (!maNhanVien) {
        validateUser(currentUser, 'bắt đầu bài thi');
        return;
      }

      const preparedQuestions = createShuffledQuestions(kyThi, questionList);

      const newTestPayload: Partial<BaiThiLam> = {
        ky_thi_id: kyThi.id,
        nhan_vien_id: maNhanVien,
        ngay_lam_bai: new Date().toISOString().split('T')[0],
        thoi_gian_bat_dau: null,
        thoi_gian_ket_thuc: null,
        diem_so: 0,
        tong_so_cau: preparedQuestions.length,
        trang_thai: 'Chưa thi',
        chi_tiet_bai_lam: preparedQuestions.map(q => ({
          cau_hoi_id: q.id,
          dap_an_da_chon: null,
          thu_tu_dap_an: q.shuffledAnswers.map(a => a.originalIndex)
        })),
        danh_gia: null,
      };

      const tempTest: BaiThiLam = {
        id: -Date.now(),
        ky_thi_id: kyThi.id,
        nhan_vien_id: maNhanVien,
        ngay_lam_bai: newTestPayload.ngay_lam_bai!,
        thoi_gian_bat_dau: null,
        thoi_gian_ket_thuc: null,
        diem_so: 0,
        tong_so_cau: preparedQuestions.length,
        trang_thai: 'Chưa thi',
        chi_tiet_bai_lam: newTestPayload.chi_tiet_bai_lam as any,
        danh_gia: null,
      };

      setSelectedKyThi(kyThi);
      setShuffledQuestions(preparedQuestions);
      setCurrentTest(tempTest);
      setUserAnswers(new Array(preparedQuestions.length).fill(null));
      setCurrentQuestionIndex(0);
      setTimeLeft(kyThi.so_phut_lam_bai * 60);
      setIsTimeWarning(false);
      setView('test');

      const result = await addBaiThiMutation.mutateAsync(newTestPayload);
      if (result) {
        // Update currentTest với result từ server và restore shuffled questions
        const restoredQuestions = restoreShuffledQuestions(result, questionList);
        setShuffledQuestions(restoredQuestions);
        setCurrentTest(result);
        // View đã được set thành 'test' ở trên
      } else {
        addToast({ message: 'Không thể tạo bài thi mới. Vui lòng thử lại.', type: 'error' });
        setView('detail');
        setCurrentTest(null);
        setShuffledQuestions([]);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      addToast({
        message: `Lỗi khi bắt đầu bài thi: ${getErrorMessage(error)}`,
        type: 'error',
      });
    }
  }, [
    questionList,
    currentUser,
    addBaiThiMutation,
    setSelectedKyThi,
    setShuffledQuestions,
    setCurrentTest,
    setUserAnswers,
    setCurrentQuestionIndex,
    setTimeLeft,
    setIsTimeWarning,
    setView,
    addToast,
  ]);

  const handleContinueTest = useCallback((baiThi: BaiThiLam) => {
    const kyThi = kyThiList.find(k => k.id === baiThi.ky_thi_id);
    if (!kyThi) return;
    setSelectedKyThi(kyThi);

    const preparedQuestions = restoreShuffledQuestions(baiThi, questionList);
    setShuffledQuestions(preparedQuestions);

    const userAnswersFromData = baiThi.chi_tiet_bai_lam.map(detail => detail.dap_an_da_chon);

    setCurrentTest(baiThi);
    setUserAnswers(userAnswersFromData);
    setCurrentQuestionIndex(0);

    if (baiThi.trang_thai === 'Đang thi' && baiThi.thoi_gian_bat_dau) {
      const startTime = new Date(baiThi.thoi_gian_bat_dau).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      setTimeLeft(Math.max(0, (kyThi.so_phut_lam_bai * 60) - elapsedSeconds));
    } else {
      setTimeLeft(kyThi.so_phut_lam_bai * 60);
    }

    setView('test');
  }, [kyThiList, questionList, setSelectedKyThi, setShuffledQuestions, setCurrentTest, setUserAnswers, setCurrentQuestionIndex, setTimeLeft, setView]);

  const handleStartTimerAndTest = useCallback(async (currentTest: BaiThiLam) => {
    const updatedTest = {
      ...currentTest,
      trang_thai: 'Đang thi' as const,
      thoi_gian_bat_dau: new Date().toISOString(),
    };
    setCurrentTest(updatedTest);
    await updateBaiThiMutation.mutateAsync(updatedTest as Partial<BaiThiLam> & { id: number });
  }, [setCurrentTest, updateBaiThiMutation]);

  const finalizeTest = useCallback(async (
    currentTest: BaiThiLam,
    shuffledQuestions: ShuffledQuestion[],
    userAnswers: (number | null)[],
    timeLeft: number
  ) => {
    const isLate = timeLeft <= 0;

    let score = 0;
    const updatedChiTiet = currentTest.chi_tiet_bai_lam.map((detail, index) => {
      const question = shuffledQuestions[index];
      const chosenAnswer = userAnswers[index];

      if (chosenAnswer !== null && chosenAnswer === question.dap_an_dung) {
        score++;
      }

      return {
        ...detail,
        dap_an_da_chon: chosenAnswer,
      };
    });

    const passRate = (score / currentTest.tong_so_cau) * 100;
    const finalStatus = !isLate && passRate >= 85 ? 'Đạt' : 'Không đạt';

    const finalTestResult: BaiThiLam = {
      ...currentTest,
      diem_so: score,
      chi_tiet_bai_lam: updatedChiTiet,
      thoi_gian_ket_thuc: new Date().toISOString(),
      trang_thai: finalStatus,
    };

    await updateBaiThiMutation.mutateAsync(finalTestResult as Partial<BaiThiLam> & { id: number });

    setFinalResult(finalTestResult);
    setView('result');
    setIsTimeWarning(false);
  }, [updateBaiThiMutation, setFinalResult, setView, setIsTimeWarning]);

  return {
    handleSave,
    handleDelete,
    handleStartTest,
    handleContinueTest,
    handleStartTimerAndTest,
    finalizeTest,
  };
}

