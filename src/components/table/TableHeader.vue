<template>
  <div class="flex items-center bg-slate-900/95 border-b-2 border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md select-none">
    <div class="w-[70px] shrink-0 p-3 flex items-center gap-1 text-slate-500 cursor-default" title="Relative Pin Slot Index">
      <Pin :size="13" />
      <span>Slot</span>
    </div>

    <div
      class="w-[110px] shrink-0 p-3 flex items-center gap-1.5 cursor-pointer hover:text-slate-100 hover:bg-slate-800/40 transition-colors"
      @click="$emit('sort', 'id')"
    >
      <span>ID</span>
      <div class="flex items-center gap-1">
        <span v-if="getSortInfo('id').priority" class="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none">
          #{{ getSortInfo('id').priority }}
        </span>
        <ArrowUp v-if="getSortInfo('id').direction === 'asc'" :size="12" class="text-indigo-400" />
        <ArrowDown v-else-if="getSortInfo('id').direction === 'desc'" :size="12" class="text-indigo-400" />
        <ArrowUpDown v-else :size="11" class="text-slate-600 opacity-40 group-hover:opacity-80" />
      </div>
    </div>

    <div
      class="flex-[2] min-w-[170px] p-3 flex items-center gap-1.5 cursor-pointer hover:text-slate-100 hover:bg-slate-800/40 transition-colors"
      @click="$emit('sort', 'userName')"
    >
      <span>User Name</span>
      <div class="flex items-center gap-1">
        <span v-if="getSortInfo('userName').priority" class="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none">
          #{{ getSortInfo('userName').priority }}
        </span>
        <ArrowUp v-if="getSortInfo('userName').direction === 'asc'" :size="12" class="text-indigo-400" />
        <ArrowDown v-else-if="getSortInfo('userName').direction === 'desc'" :size="12" class="text-indigo-400" />
        <ArrowUpDown v-else :size="11" class="text-slate-600 opacity-40 group-hover:opacity-80" />
      </div>
    </div>

    <div
      class="flex-[2] min-w-[190px] p-3 flex items-center gap-1.5 cursor-pointer hover:text-slate-100 hover:bg-slate-800/40 transition-colors"
      @click="$emit('sort', 'position')"
    >
      <span>Position</span>
      <div class="flex items-center gap-1">
        <span v-if="getSortInfo('position').priority" class="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none">
          #{{ getSortInfo('position').priority }}
        </span>
        <ArrowUp v-if="getSortInfo('position').direction === 'asc'" :size="12" class="text-indigo-400" />
        <ArrowDown v-else-if="getSortInfo('position').direction === 'desc'" :size="12" class="text-indigo-400" />
        <ArrowUpDown v-else :size="11" class="text-slate-600 opacity-40 group-hover:opacity-80" />
      </div>
    </div>

    <div
      class="flex-[1.5] min-w-[150px] p-3 flex items-center gap-1.5 cursor-pointer hover:text-slate-100 hover:bg-slate-800/40 transition-colors"
      @click="$emit('sort', 'location')"
    >
      <span>Location</span>
      <div class="flex items-center gap-1">
        <span v-if="getSortInfo('location').priority" class="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none">
          #{{ getSortInfo('location').priority }}
        </span>
        <ArrowUp v-if="getSortInfo('location').direction === 'asc'" :size="12" class="text-indigo-400" />
        <ArrowDown v-else-if="getSortInfo('location').direction === 'desc'" :size="12" class="text-indigo-400" />
        <ArrowUpDown v-else :size="11" class="text-slate-600 opacity-40 group-hover:opacity-80" />
      </div>
    </div>

    <div
      class="w-[80px] shrink-0 p-3 flex items-center justify-end gap-1.5 cursor-pointer hover:text-slate-100 hover:bg-slate-800/40 transition-colors"
      @click="$emit('sort', 'age')"
    >
      <span>Age</span>
      <div class="flex items-center gap-1">
        <span v-if="getSortInfo('age').priority" class="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none">
          #{{ getSortInfo('age').priority }}
        </span>
        <ArrowUp v-if="getSortInfo('age').direction === 'asc'" :size="12" class="text-indigo-400" />
        <ArrowDown v-else-if="getSortInfo('age').direction === 'desc'" :size="12" class="text-indigo-400" />
        <ArrowUpDown v-else :size="11" class="text-slate-600 opacity-40" />
      </div>
    </div>

    <div
      class="w-[130px] shrink-0 p-3 flex items-center justify-end gap-1.5 cursor-pointer hover:text-slate-100 hover:bg-slate-800/40 transition-colors"
      @click="$emit('sort', 'dateStart')"
    >
      <span>Date Start</span>
      <div class="flex items-center gap-1">
        <span v-if="getSortInfo('dateStart').priority" class="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none">
          #{{ getSortInfo('dateStart').priority }}
        </span>
        <ArrowUp v-if="getSortInfo('dateStart').direction === 'asc'" :size="12" class="text-indigo-400" />
        <ArrowDown v-else-if="getSortInfo('dateStart').direction === 'desc'" :size="12" class="text-indigo-400" />
        <ArrowUpDown v-else :size="11" class="text-slate-600 opacity-40" />
      </div>
    </div>

    <div class="w-[120px] shrink-0 p-3 flex items-center justify-center text-slate-400 cursor-default">
      <span>Actions</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-vue-next';
import type { SortCriteria, SortField } from '../../types';

const props = defineProps<{
  sortCriteria: SortCriteria[];
}>();

defineEmits<{
  (e: 'sort', field: SortField): void;
}>();

function getSortInfo(field: SortField) {
  const existing = props.sortCriteria.find((s) => s.field === field);
  return {
    direction: existing ? existing.direction : null,
    priority: existing ? existing.priority : null,
  };
}
</script>
