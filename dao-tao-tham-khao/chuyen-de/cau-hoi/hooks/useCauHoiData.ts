/**
 * useCauHoiData Hook
 * 
 * Hook for data fetching and management for CauHoi sub-module
 * Uses TanStack Query directly for data fetching
 */

import { useMemo } from 'react';
import { useAuth } from '@lib/contexts/AuthContext';
import { useCauHoi } from '@lib/hooks/queries/useTraining';
import { useChuyenDe } from '@lib/hooks/queries/useTraining';
import { type CauHoiData, type EnhancedQuestion } from '@src/types';

/**
 * Hook for computing derived data and statistics for CauHoi sub-module
 */
export function useCauHoiData(): CauHoiData {
  const { enhancedEmployees } = useAuth();
  
  // Fetch data using TanStack Query directly
  const { data: questionList = [] } = useCauHoi();
  const { data: topicList = [] } = useChuyenDe();

  // Create employee map
  const employeeMap = useMemo(() => {
    return new Map(enhancedEmployees.map(e => [e.id, e.ho_ten]));
  }, [enhancedEmployees]);

  // Create a map of topic IDs to topic names
  const topicMap = useMemo(() => {
    return new Map(topicList.map(t => [t.id, t.ten_chuyen_de]));
  }, [topicList]);

  // Enhance questions with topic name
  const enhancedQuestions = useMemo<EnhancedQuestion[]>(() => {
    return questionList.map(question => ({
      ...question,
      topicName: topicMap.get(question.chuyen_de_id) || 'N/A',
    }));
  }, [questionList, topicMap]);

  return {
    questionList,
    topicList,
    employeeMap,
    topicMap,
    enhancedQuestions,
  };
}

