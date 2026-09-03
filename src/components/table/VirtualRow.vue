<template>
  <div
    class="flex items-center text-xs sm:text-sm h-[52px] border-b border-slate-800/80 transition-colors"
    :class="[
      record.pinnedPosition !== null
        ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-l-amber-500'
        : 'bg-slate-900/40 hover:bg-slate-800/70 border-l-4 border-l-transparent'
    ]"
  >
    <!-- Pin Slot Cell -->
    <div class="w-[70px] shrink-0 px-3 py-2 flex items-center overflow-hidden">
      <UBadge
        v-if="record.pinnedPosition !== null"
        color="warning"
        variant="subtle"
        size="xs"
        :title="`Pinned to Slot #${record.pinnedPosition}`"
      >
        <Pin :size="10" class="mr-0.5" />
        #{{ record.pinnedPosition }}
      </UBadge>
      <span v-else class="text-xs font-mono text-slate-600 pl-2">-</span>
    </div>

    <!-- ID Cell -->
    <div class="w-[110px] shrink-0 px-3 py-2 flex items-center font-mono text-xs text-slate-400 overflow-hidden">
      <span class="truncate">{{ record.id }}</span>
    </div>

    <!-- Name Cell -->
    <div class="flex-[2] min-w-[170px] px-3 py-2 flex items-center overflow-hidden">
      <div class="flex items-center gap-2 truncate">
        <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/40 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
          {{ getInitials(record.userName) }}
        </div>
        <span class="font-medium text-slate-100 truncate" v-html="highlightMatch(record.userName, searchQuery)"></span>
      </div>
    </div>

    <!-- Position Cell -->
    <div class="flex-[2] min-w-[190px] px-3 py-2 flex items-center overflow-hidden">
      <span class="text-slate-300 text-xs truncate" v-html="highlightMatch(record.position, searchQuery)"></span>
    </div>

    <!-- Location Cell -->
    <div class="flex-[1.5] min-w-[150px] px-3 py-2 flex items-center overflow-hidden">
      <span class="text-slate-400 text-xs truncate" v-html="highlightMatch(record.location, searchQuery)"></span>
    </div>

    <!-- Age Cell -->
    <div class="w-[80px] shrink-0 px-3 py-2 flex items-center justify-end font-mono text-xs overflow-hidden">
      <UBadge color="neutral" variant="subtle" size="xs">
        {{ record.age }}
      </UBadge>
    </div>

    <!-- Date Start Cell -->
    <div class="w-[130px] shrink-0 px-3 py-2 flex items-center justify-end font-mono text-xs text-slate-400 overflow-hidden">
      <span class="truncate">{{ record.dateStart }}</span>
    </div>

    <!-- Actions Cell with Nuxt UI UButton -->
    <div class="w-[120px] shrink-0 px-3 py-2 flex items-center justify-center gap-1 overflow-hidden">
      <UButton
        v-if="record.pinnedPosition !== null"
        size="xs"
        color="warning"
        variant="soft"
        icon="i-lucide-pin-off"
        title="Unpin this row"
        @click="$emit('unpin', record.id)"
      />
      <UButton
        v-else
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-lucide-pin"
        title="Pin to relative slot"
        @click="$emit('pin', record)"
      />

      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-lucide-edit"
        title="Edit record details"
        @click="$emit('edit', record)"
      />

      <UButton
        size="xs"
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        title="Delete record"
        @click="$emit('delete', record)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin } from 'lucide-vue-next';
import type { DataRecord } from '../../types';

defineProps<{
  record: DataRecord;
  searchQuery: string;
}>();

defineEmits<{
  (e: 'pin', record: DataRecord): void;
  (e: 'unpin', id: string): void;
  (e: 'edit', record: DataRecord): void;
  (e: 'delete', record: DataRecord): void;
}>();

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="bg-amber-500/35 text-white px-0.5 rounded font-bold">$1</mark>');
}
</script>
