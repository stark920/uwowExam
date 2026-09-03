<template>
  <div class="flex flex-col overflow-hidden h-[calc(100vh-240px)] min-h-[480px] relative rounded-xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-xl shadow-2xl">
    <!-- Table Header (Sticky Top) -->
    <TableHeader
      :sort-criteria="sortCriteria"
      @sort="$emit('sort', $event)"
    />

    <!-- Sticky Pinned Rows Fixed On Top -->
    <div
      v-if="pinnedItems.length > 0"
      class="sticky top-0 z-20 bg-slate-900/95 border-b-2 border-amber-500/40 backdrop-blur-md shadow-lg"
    >
      <div class="px-3 py-1.5 bg-amber-500/10 flex items-center gap-2 text-xs font-semibold text-amber-400 border-b border-amber-500/20">
        <Pin :size="12" class="text-amber-400" />
        <span>PINNED ROWS (FIXED ON TOP &bull; {{ pinnedItems.length }})</span>
      </div>
      <div class="divide-y divide-slate-800/60">
        <VirtualRow
          v-for="pinnedRecord in pinnedItems"
          :key="pinnedRecord.id"
          :record="pinnedRecord"
          :search-query="searchQuery"
          @pin="$emit('pin', $event)"
          @unpin="$emit('unpin', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>

    <!-- Virtualized Scroll Body -->
    <div
      ref="scrollContainerRef"
      class="flex-1 overflow-y-auto overflow-x-auto relative scroll-smooth"
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

      <!-- Empty State -->
      <div v-if="unpinnedItems.length === 0 && pinnedItems.length === 0" class="flex flex-col items-center justify-center py-20 px-8 gap-3 text-slate-400">
        <Inbox :size="48" class="opacity-30 text-slate-500" />
        <h3 class="text-base font-semibold text-slate-200">No Records Found</h3>
        <p class="text-xs text-slate-400">No records match your search criteria or the database is empty.</p>
        <UButton
          v-if="searchQuery"
          class="mt-2"
          size="xs"
          color="neutral"
          variant="outline"
          label="Clear Search Filter"
          @click="$emit('clear:query')"
        />
      </div>

      <!-- Batch Loader Footer -->
      <div v-if="isBatchLoading" class="flex items-center justify-center gap-2 p-3.5 bg-slate-900/90 border-t border-slate-800 text-amber-400 text-xs font-medium sticky bottom-0 z-10 backdrop-blur-md">
        <RefreshCw :size="16" class="animate-spin text-amber-400" />
        <span>Loading Next 500 Records via Cursor...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RefreshCw, Inbox, Pin } from 'lucide-vue-next';
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

// Separate pinned rows from unpinned rows
const pinnedItems = computed(() => {
  return props.items
    .filter((r) => r.pinnedPosition !== null)
    .sort((a, b) => (a.pinnedPosition ?? 0) - (b.pinnedPosition ?? 0));
});

const unpinnedItems = computed(() => {
  return props.items.filter((r) => r.pinnedPosition === null);
});

const {
  visibleItems,
  topPadding,
  bottomPadding,
  handleScroll,
  scrollToTop,
} = useVirtualScroll<DataRecord>({
  items: unpinnedItems,
  itemHeight: 52,
  overscan: 8,
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
