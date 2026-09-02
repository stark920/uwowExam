<template>
  <div class="search-filter-bar glass-panel">
    <div class="search-container">
      <div class="search-input-wrapper">
        <Search :size="16" class="search-icon" />
        <input
          type="text"
          :value="rawQuery"
          @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
          placeholder="Search across name, position, location, age, or date..."
          class="search-input"
        />
        <div v-if="isSearching" class="searching-badge">
          <RefreshCw :size="12" class="spin-icon" />
          <span>300ms</span>
        </div>
        <button v-if="rawQuery" @click="$emit('clear:query')" class="clear-btn" title="Clear search">
          <X :size="14" />
        </button>
      </div>

      <div class="filter-count">
        <span class="count-badge">
          <strong>{{ filteredCount.toLocaleString() }}</strong> / {{ totalCount.toLocaleString() }} items
        </span>
      </div>
    </div>

    <div class="filter-actions">
      <!-- Active Multi-Sort Chips -->
      <div v-if="sortCriteria.length > 0" class="sort-chips-container">
        <span class="sort-label">Sort Priority:</span>
        <div
          v-for="sort in sortCriteria"
          :key="sort.field"
          class="sort-chip"
          :title="`Priority #${sort.priority}: Sorted by ${formatField(sort.field)} ${sort.direction.toUpperCase()}`"
        >
          <span class="priority-badge">#{{ sort.priority }}</span>
          <span class="chip-name">{{ formatField(sort.field) }}</span>
          <span class="chip-direction">
            <ArrowUp v-if="sort.direction === 'asc'" :size="12" />
            <ArrowDown v-else :size="12" />
          </span>
          <button @click="$emit('remove:sort', sort.field)" class="chip-remove" title="Remove this sort">
            <X :size="11" />
          </button>
        </div>

        <button @click="$emit('clear:sorts')" class="btn-clear-all" title="Reset all sorting">
          Reset
        </button>
      </div>

      <!-- Mobile View Mode Toggle (Card vs Table) -->
      <div class="view-toggle-group">
        <button
          class="view-toggle-btn"
          :class="{ active: viewMode === 'card' }"
          @click="$emit('update:viewMode', 'card')"
          title="Mobile Card View"
        >
          <LayoutGrid :size="14" />
          <span class="view-toggle-label">Cards</span>
        </button>
        <button
          class="view-toggle-btn"
          :class="{ active: viewMode === 'table' }"
          @click="$emit('update:viewMode', 'table')"
          title="Data Table View"
        >
          <Table :size="14" />
          <span class="view-toggle-label">Table</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, X, RefreshCw, ArrowUp, ArrowDown, LayoutGrid, Table } from 'lucide-vue-next';
import type { SortCriteria, SortField } from '../../types';

defineProps<{
  rawQuery: string;
  isSearching: boolean;
  filteredCount: number;
  totalCount: number;
  sortCriteria: SortCriteria[];
  viewMode: 'table' | 'card';
}>();

defineEmits<{
  (e: 'update:query', val: string): void;
  (e: 'clear:query'): void;
  (e: 'remove:sort', field: SortField): void;
  (e: 'clear:sorts'): void;
  (e: 'update:viewMode', mode: 'table' | 'card'): void;
}>();

function formatField(field: SortField): string {
  const map: Record<SortField, string> = {
    id: 'ID',
    userName: 'Name',
    position: 'Position',
    location: 'Location',
    age: 'Age',
    dateStart: 'Start Date',
  };
  return map[field] || field;
}
</script>

<style scoped>
.search-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 280px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.55rem 2.4rem 0.55rem 2.4rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  background: rgba(15, 23, 42, 1);
}

.search-input::placeholder {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.searching-badge {
  position: absolute;
  right: 2.2rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(99, 102, 241, 0.2);
  color: var(--indigo-text);
  font-size: 0.68rem;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-full);
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.clear-btn {
  position: absolute;
  right: 0.6rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.count-badge {
  font-size: 0.78rem;
  color: var(--text-secondary);
  background: rgba(30, 41, 59, 0.6);
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  white-space: nowrap;
}

.count-badge strong {
  color: #ffffff;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sort-chips-container {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.sort-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.sort-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: var(--text-primary);
  font-size: 0.74rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
  animation: fadeIn 0.2s ease-out;
}

.priority-badge {
  background: var(--accent-primary);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.05rem 0.3rem;
  border-radius: 999px;
}

.chip-name {
  font-weight: 600;
}

.chip-direction {
  display: flex;
  align-items: center;
  color: var(--indigo-text);
}

.chip-remove {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.1rem;
  border-radius: 50%;
}

.chip-remove:hover {
  color: var(--rose-text);
  background: rgba(244, 63, 94, 0.2);
}

.btn-clear-all {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.72rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.2rem 0.4rem;
}

.btn-clear-all:hover {
  color: var(--text-primary);
}

.view-toggle-group {
  display: flex;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 2px;
}

.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.35rem 0.65rem;
  border-radius: calc(var(--radius-md) - 2px);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-toggle-btn:hover {
  color: var(--text-primary);
}

.view-toggle-btn.active {
  background: rgba(99, 102, 241, 0.25);
  color: #ffffff;
  font-weight: 600;
}

@media (max-width: 640px) {
  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper {
    max-width: 100%;
  }
  .filter-actions {
    justify-content: space-between;
  }
}
</style>
