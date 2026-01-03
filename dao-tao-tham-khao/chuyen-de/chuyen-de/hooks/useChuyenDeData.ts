/**
 * useChuyenDeData Hook
 * 
 * Hook for data fetching and management for ChuyenDe sub-module
 * Uses TanStack Query directly for data fetching
 */

import { useMemo } from 'react';
import { useAuth } from '@lib/contexts/AuthContext';
import { useChuyenDe } from '@lib/hooks/queries/useTraining';
import { useChuyenDeNhom } from '@lib/hooks/queries/useTraining';
import { useCauHoi } from '@lib/hooks/queries/useTraining';
import { type ChuyenDeData, type EnhancedTopic } from '@src/types';

/**
 * Hook for computing derived data and statistics for ChuyenDe sub-module
 */
export function useChuyenDeData(): ChuyenDeData {
  const { enhancedEmployees } = useAuth();
  
  // Fetch data using TanStack Query directly
  const { data: topicList = [] } = useChuyenDe();
  const { data: groupList = [] } = useChuyenDeNhom();
  const { data: questionList = [] } = useCauHoi();

  // Create employee map
  const employeeMap = useMemo(() => {
    return new Map(enhancedEmployees.map(e => [e.id, e.ho_ten]));
  }, [enhancedEmployees]);

  // Create a map of group IDs to group names
  const groupMap = useMemo(() => {
    return new Map(groupList.map(g => [g.id, g.ten_nhom]));
  }, [groupList]);

  // Calculate question count by topic
  const questionCountByTopic = useMemo(() => {
    const map = new Map<number, number>();
    questionList.forEach(question => {
      map.set(question.chuyen_de_id, (map.get(question.chuyen_de_id) || 0) + 1);
    });
    return map;
  }, [questionList]);

  // Enhance topics with group name and question count
  const enhancedTopics = useMemo<EnhancedTopic[]>(() => {
    return topicList.map(topic => ({
      ...topic,
      groupName: groupMap.get(topic.nhom_id) || 'N/A',
      questionCount: questionCountByTopic.get(topic.id) || 0,
    }));
  }, [topicList, groupMap, questionCountByTopic]);

  return {
    topicList,
    groupList,
    questionList,
    employeeMap,
    groupMap,
    questionCountByTopic,
    enhancedTopics,
  };
}

