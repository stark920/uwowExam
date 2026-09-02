<template>
  <div class="table-container glass-panel">
    <TableHeader
      :sort-criteria="sortCriteria"
      @sort="$emit('sort', $event)"
    />

    <div
      ref="scrollContainerRef"
      class="table-body-scroller"
      @scroll="handleScroll"
    >
      <div :style="{ height: `${topPadding}px` }"></div>

      <VirtualRow
        v-for="virtualItem in visibleItems"
        :key="virtualItem.item.id"
        :record="virtualItem.item"
        :search-query="searchQuery"
        @pin="$emit('pin', $event)"
        @unpin="$emit('unpin', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />

      <div :style="{ height: `${bottomPadding}px` }"></div>

      <div v-if="items.length === 0" class="empty-state">
        <Inbox :size="48" class="empty-icon text-muted" />
        <h3 class="empty-title">No Records Found</h3>
        <p class="empty-desc">No records match your search criteria or the database is empty.</p>
        <button v-if="searchQuery" class="btn btn-secondary btn-sm" @click="$emit('clear:query')">
          Clear Search Filter
        </button>
      </div>

      <div v-if="isBatchLoading" class="batch-loader-footer">
        <RefreshCw :size="16" class="spin-icon text-amber-400" />
        <span>Loading Next 500 Records via Cursor...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue';
import { RefreshCw, Inbox } from 'lucide-vue-next';
import type { DataRecord, SortCriteria, SortField } from '../../types';
import TableHeader from './TableHeader.vue';
import VirtualRow from './VirtualRow.vue';
import { useVirtualScroll } from '../../composables/useVirtualScroll';

const props = defineProps<{
  items: DataRecord[];
  sortCriteria: SortCriteria[];
  searchQuery: string;
  isBatchLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'sort', field: SortField): void;
  (e: 'pin', record: DataRecord): void;
  (e: 'unpin', id: string): void;
  (e: 'edit', record: DataRecord): void;
  (e: 'delete', record: DataRecord): void;
  (e: 'reach:bottom'): void;
  (e: 'clear:query'): void;
}>();

const scrollContainerRef = ref<HTMLElement | null>(null);

const {
  visibleItems,
  topPadding,
  bottomPadding,
  handleScroll,
  scrollToTop,
} = useVirtualScroll<DataRecord>({
  items: toRef(props, 'items'),
  itemHeight: 52,
  overscan: 6,
  containerRef: scrollContainerRef,
  onReachBottom: () => {
    emit('reach:bottom');
  },
  reachBottomThreshold: 350,
});

defineExpose({
  scrollToTop,
});
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 240px);
  min-height: 480px;
  position: relative;
}

.table-body-scroller {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  scroll-behavior: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.empty-icon {
  opacity: 0.3;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.batch-loader-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem;
  background: rgba(15, 23, 42, 0.9);
  border-top: 1px solid var(--border-subtle);
  color: var(--amber-text);
  font-size: 0.82rem;
  font-weight: 500;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
