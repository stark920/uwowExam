<template>
  <div class="flex flex-col overflow-hidden h-[calc(100vh-240px)] min-h-[480px] relative rounded-xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-xl shadow-2xl">
    <!-- Pinned Cards Fixed On Top (Zero Gap) -->
    <div
      v-if="pinnedItems.length > 0"
      class="shrink-0 z-20 bg-slate-900/95 border-b-2 border-amber-500/40 backdrop-blur-md p-3 sm:p-4 space-y-2.5 shadow-lg max-h-[45vh] overflow-y-auto"
    >
      <div class="flex items-center gap-2 text-xs font-semibold text-amber-400">
        <Pin :size="12" class="text-amber-400" />
        <span>PINNED CARDS (FIXED ON TOP &bull; {{ pinnedItems.length }})</span>
      </div>
      <VirtualCard
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

    <!-- Virtualized Scroll Scroller -->
    <div
      ref="cardScrollContainerRef"
      class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
      @scroll="handleScroll"
    >
      <!-- Virtualized Scroll Space -->
      <div :style="{ height: `${topPadding}px` }"></div>

      <VirtualCard
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
      <div v-if="unpinnedItems.length === 0 && pinnedItems.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center gap-3 text-slate-400">
        <Inbox :size="48" class="opacity-30 text-slate-500" />
        <h3 class="text-base font-semibold text-slate-200">No Records Found</h3>
        <p class="text-xs text-slate-400">No records match your search query.</p>
        <UButton
          v-if="searchQuery"
          class="mt-2"
          size="xs"
          color="neutral"
          variant="outline"
          label="Clear Filter"
          @click="$emit('clear:query')"
        />
      </div>

      <!-- Batch Loader Footer -->
      <div v-if="isBatchLoading" class="flex items-center justify-center gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-amber-400 text-xs font-medium sticky bottom-0 z-10 backdrop-blur-md">
        <RefreshCw :size="16" class="animate-spin text-amber-400" />
        <span>Loading Next 500 Records...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RefreshCw, Inbox, Pin } from 'lucide-vue-next';
import type { DataRecord } from '../../types';
import VirtualCard from './VirtualCard.vue';
import { useVirtualScroll } from '../../composables/useVirtualScroll';

const props = defineProps<{
  items: DataRecord[];
  searchQuery: string;
  isBatchLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'pin', record: DataRecord): void;
  (e: 'unpin', id: string): void;
  (e: 'edit', record: DataRecord): void;
  (e: 'delete', record: DataRecord): void;
  (e: 'reach:bottom'): void;
  (e: 'clear:query'): void;
}>();

const cardScrollContainerRef = ref<HTMLElement | null>(null);

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
  itemHeight: 200,
  overscan: 6,
  containerRef: cardScrollContainerRef,
  onReachBottom: () => {
    emit('reach:bottom');
  },
  reachBottomThreshold: 400,
});

defineExpose({
  scrollToTop,
});
</script>
