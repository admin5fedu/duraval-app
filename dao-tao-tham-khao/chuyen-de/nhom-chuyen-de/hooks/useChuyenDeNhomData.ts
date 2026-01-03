/**
 * useChuyenDeNhomData Hook
 * 
 * Hook for data fetching and management for ChuyenDeNhom sub-module
 * Uses TanStack Query directly for data fetching
 */

import { useMemo } from 'react';
import { useAuth } from '@lib/contexts/AuthContext';
import { useChuyenDeNhom } from '@lib/hooks/queries/useTraining';
import { useChuyenDe } from '@lib/hooks/queries/useTraining';
import { useCauHoi } from '@lib/hooks/queries/useTraining';
import { type ChuyenDeNhomData, type GroupStats } from '@src/types';
import { type ChuyenDe, type CauHoi } from '@src/types';

/**
 * Hook for computing derived data and statistics for ChuyenDeNhom sub-module
 */
export function useChuyenDeNhomData(): ChuyenDeNhomData {
  const { enhancedEmployees } = useAuth();
  
  // Fetch data using TanStack Query directly
  const { data: groupList = [] } = useChuyenDeNhom();
  const { data: topicList = [] } = useChuyenDe();
  const { data: questionList = [] } = useCauHoi();

  // Create employee map
  const employeeMap = useMemo(() => {
    return new Map(enhancedEmployees.map(e => [e.id, e.ho_ten]));
  }, [enhancedEmployees]);

  // Calculate question count by topic
  const questionCountByTopic = useMemo(() => {
    const map = new Map<number, number>();
    questionList.forEach((question: CauHoi) => {
      map.set(question.chuyen_de_id, (map.get(question.chuyen_de_id) || 0) + 1);
    });
    return map;
  }, [questionList]);

  // Calculate group statistics
  const groupStats = useMemo(() => {
    const stats: Record<number, GroupStats> = {};
    
    // Initialize stats for all groups
    groupList.forEach(group => {
      stats[group.id] = { topicCount: 0, questionCount: 0 };
    });
    
    // Calculate stats from topics
    topicList.forEach((topic: ChuyenDe) => {
      if (!stats[topic.nhom_id]) {
        stats[topic.nhom_id] = { topicCount: 0, questionCount: 0 };
      }
      stats[topic.nhom_id].topicCount += 1;
      stats[topic.nhom_id].questionCount += questionCountByTopic.get(topic.id) || 0;
    });
    
    return stats;
  }, [groupList, topicList, questionCountByTopic]);

  return {
    groupList,
    topicList,
    questionList,
    employeeMap,
    groupStats,
  };
}

