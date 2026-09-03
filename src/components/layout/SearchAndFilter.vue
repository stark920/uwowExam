<template>
  <div class="flex items-center justify-between p-3 sm:px-5 rounded-2xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-xl shadow-lg gap-3 flex-wrap">
    <div class="flex items-center gap-3 flex-1 min-w-[280px]">
      <div class="relative flex items-center flex-1 max-w-[480px]">
        <UInput
          :model-value="rawQuery"
          @update:model-value="$emit('update:query', $event)"
          icon="i-lucide-search"
          placeholder="Search across name, position, location, age, or date..."
          class="w-full"
          size="md"
        >
          <template #trailing>
            <div class="flex items-center gap-1.5">
              <UBadge v-if="isSearching" color="primary" variant="subtle" size="xs" class="font-mono">
                <RefreshCw :size="10" class="animate-spin mr-0.5" />
                300ms
              </UBadge>
              <UButton
                v-if="rawQuery"
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                size="xs"
                @click="$emit('clear:query')"
              />
            </div>
          </template>
        </UInput>
      </div>

      <UBadge color="neutral" variant="subtle" size="md">
        <strong class="text-white mr-1">{{ filteredCount.toLocaleString() }}</strong> / {{ totalCount.toLocaleString() }} items
      </UBadge>
    </div>

    <div class="flex items-center gap-3 flex-wrap">
      <!-- Active Multi-Sort Chips with Nuxt UI UBadge -->
      <div v-if="sortCriteria.length > 0" class="flex items-center gap-1.5 flex-wrap">
        <span class="text-xs text-slate-400 font-medium">Sort:</span>
        <UBadge
          v-for="sort in sortCriteria"
          :key="sort.field"
          color="primary"
          variant="subtle"
          size="md"
          class="cursor-default"
          :title="`Priority #${sort.priority}: Sorted by ${formatField(sort.field)} ${sort.direction.toUpperCase()}`"
        >
          <span class="bg-indigo-600 text-white text-[10px] font-bold px-1 rounded-full mr-1 leading-none">
            #{{ sort.priority }}
          </span>
          <span class="font-medium mr-1">{{ formatField(sort.field) }}</span>
          <ArrowUp v-if="sort.direction === 'asc'" :size="11" class="mr-1" />
          <ArrowDown v-else :size="11" class="mr-1" />
          <button @click.stop="$emit('remove:sort', sort.field)" class="hover:text-rose-400 cursor-pointer ml-0.5" title="Remove this sort">
            <X :size="11" />
          </button>
        </UBadge>

        <UButton
          size="xs"
          color="neutral"
          variant="link"
          label="Reset"
          @click="$emit('clear:sorts')"
        />
      </div>

      <!-- Mobile View Mode Toggle (Card vs Table) with UButton -->
      <div class="flex bg-slate-950/80 border border-slate-800 p-1 rounded-xl gap-1">
        <UButton
          size="xs"
          :color="viewMode === 'card' ? 'primary' : 'neutral'"
          :variant="viewMode === 'card' ? 'soft' : 'ghost'"
          icon="i-lucide-layout-grid"
          label="Cards"
          @click="$emit('update:viewMode', 'card')"
        />
        <UButton
          size="xs"
          :color="viewMode === 'table' ? 'primary' : 'neutral'"
          :variant="viewMode === 'table' ? 'soft' : 'ghost'"
          icon="i-lucide-table"
          label="Table"
          @click="$emit('update:viewMode', 'table')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, RefreshCw, ArrowUp, ArrowDown } from 'lucide-vue-next';
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
