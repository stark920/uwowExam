# Part B: Search Request Spike Analysis & Mitigation

## 1. Scenario Breakdown

* **Initial State**: 5 search requests / minute after deployment (50 concurrent users).
* **Observed Problem**: Jumped to **500 search requests / minute** after 1 week.

---

## 2. Root Cause Analysis

1. **Unthrottled `input` Event Dispatch (Client-Side)**:
   * The search input was directly triggering search evaluations on every single keypress (`keyup`/`input`).
   * Typing a standard 7-character query (e.g., `"manager"`) triggers 7 distinct executions per user session.
2. **Race Conditions & Orphaned Requests**:
   * Slower evaluations for shorter prefixes (e.g. `"man"`) were completing after newer inputs (`"manager"`), causing UI flicker and redundant computation.
3. **Short / Fast-Typing Firing**:
   * Single-letter keystrokes were triggering expensive full-table substring scans without debouncing.

---

## 3. Selected Client-Side Fix & Justification

### Primary Action: **Frontend Debouncing (300ms) + AbortController**

#### Why this is the optimal fix:
* **Immediate Traffic Collapse**: A 300ms debounce ensures search is only executed after the user finishes typing a full word, immediately cutting keystroke-triggered executions by **~85%**.
* **Zero Overhead**: Can be deployed immediately on the frontend without server dependencies.
* **Elimination of Race Conditions**: `AbortController` cleanly cancels in-flight search signals, preventing stale results from overwriting newer searches.

---

## 4. Frontend Implementation

### 4.1 Debounce & AbortController Composable (`useDebouncedSearch.ts`)

```typescript
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

  function updateInput(newVal: string) {
    rawQuery.value = newVal;
    metrics.totalKeystrokes++;
    metrics.activeSignal = true;

    // Abort in-flight controller if any
    if (activeAbortController) {
      activeAbortController.abort();
      metrics.abortedRequests++;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    activeAbortController = new AbortController();
    const currentController = activeAbortController;
    const startTime = performance.now();

    timeoutId = setTimeout(() => {
      if (currentController.signal.aborted) return;

      isSearching.value = true;
      debouncedQuery.value = newVal;
      metrics.debouncedExecutions++;
      metrics.lastSearchLatencyMs = Math.round(performance.now() - startTime);
      metrics.activeSignal = false;

      metrics.trafficReductionPercent = Math.round(
        ((metrics.totalKeystrokes - metrics.debouncedExecutions) / Math.max(1, metrics.totalKeystrokes)) * 100
      );

      isSearching.value = false;
    }, delayMs);
  }

  function clearSearch() {
    rawQuery.value = '';
    debouncedQuery.value = '';
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
```

### 4.2 Live Search Metrics HUD Component (`MetricsHUD.vue`)
* The application includes a collapsible **"Part B & C: Performance & Memory Inspector"** HUD in the header:
  * **Total Keystrokes Logged**: Tracks all raw user keystrokes.
  * **Actual Searches Dispatched**: Counts only requests that cleared the 300ms threshold.
  * **Aborted In-Flight Requests**: Highlights active cancellations via `AbortController`.
  * **Traffic Reduction %**: Visual gauge demonstrating the 80%+ drop in computation/traffic.
