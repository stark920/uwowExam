import { ref } from 'vue';
import type { SortCriteria, SortField } from '../types';

export function useMultiSort() {
  const sortCriteria = ref<SortCriteria[]>([]);

  function toggleSort(field: SortField) {
    const existingIndex = sortCriteria.value.findIndex((s) => s.field === field);

    if (existingIndex === -1) {
      const nextPriority = sortCriteria.value.length + 1;
      sortCriteria.value.push({
        field,
        direction: 'asc',
        priority: nextPriority,
      });
    } else {
      const current = sortCriteria.value[existingIndex];
      if (current.direction === 'asc') {
        current.direction = 'desc';
      } else {
        sortCriteria.value.splice(existingIndex, 1);
        reindexPriorities();
      }
    }
  }

  function removeSort(field: SortField) {
    const existingIndex = sortCriteria.value.findIndex((s) => s.field === field);
    if (existingIndex !== -1) {
      sortCriteria.value.splice(existingIndex, 1);
      reindexPriorities();
    }
  }

  function clearAllSorts() {
    sortCriteria.value = [];
  }

  function reindexPriorities() {
    sortCriteria.value.forEach((s, idx) => {
      s.priority = idx + 1;
    });
  }

  function getFieldSortInfo(field: SortField): { direction: 'asc' | 'desc' | null; priority: number | null } {
    const existing = sortCriteria.value.find((s) => s.field === field);
    if (existing) {
      return { direction: existing.direction, priority: existing.priority };
    }
    return { direction: null, priority: null };
  }

  return {
    sortCriteria,
    toggleSort,
    removeSort,
    clearAllSorts,
    getFieldSortInfo,
  };
}
