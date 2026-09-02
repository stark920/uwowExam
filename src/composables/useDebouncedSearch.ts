import { ref, reactive } from 'vue';
import type { SearchMetricsState } from '../types';

export function useDebouncedSearch(delayMs = 300) {
  const rawQuery = ref('');
  const debouncedQuery = ref('');
  const isSearching = ref(false);

  const metrics = reactive<SearchMetricsState>({
    totalKeystrokes: 0,
    debouncedExecutions: 0,
    abortedRequests: 0,
    trafficReductionPercent: 0,
    lastSearchLatencyMs: 0,
    activeSignal: false,
  });

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let activeAbortController: AbortController | null = null;

  function updateInput(val: string) {
    rawQuery.value = val;
    metrics.totalKeystrokes++;

    if (activeAbortController) {
      activeAbortController.abort();
      metrics.abortedRequests++;
      metrics.activeSignal = false;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;
    metrics.activeSignal = true;
    isSearching.value = true;

    const startTime = performance.now();

    timeoutId = setTimeout(() => {
      if (signal.aborted) {
        return;
      }

      debouncedQuery.value = val;
      metrics.debouncedExecutions++;
      metrics.activeSignal = false;
      isSearching.value = false;
      metrics.lastSearchLatencyMs = Math.round(performance.now() - startTime);

      if (metrics.totalKeystrokes > 0) {
        const saved = metrics.totalKeystrokes - metrics.debouncedExecutions;
        metrics.trafficReductionPercent = Math.max(
          0,
          Math.round((saved / metrics.totalKeystrokes) * 100)
        );
      }
    }, delayMs);
  }

  function clearSearch() {
    rawQuery.value = '';
    debouncedQuery.value = '';
    if (activeAbortController) {
      activeAbortController.abort();
      metrics.abortedRequests++;
    }
    if (timeoutId) clearTimeout(timeoutId);
    isSearching.value = false;
  }

  function resetMetrics() {
    metrics.totalKeystrokes = 0;
    metrics.debouncedExecutions = 0;
    metrics.abortedRequests = 0;
    metrics.trafficReductionPercent = 0;
    metrics.lastSearchLatencyMs = 0;
    metrics.activeSignal = false;
  }

  return {
    rawQuery,
    debouncedQuery,
    isSearching,
    metrics,
    updateInput,
    clearSearch,
    resetMetrics,
  };
}
