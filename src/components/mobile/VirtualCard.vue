<template>
  <div
    class="p-4 rounded-xl border flex flex-col gap-3 transition-all min-h-[190px]"
    :class="[
      record.pinnedPosition !== null
        ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5'
        : 'border-slate-800 bg-slate-900/70 hover:bg-slate-800/60'
    ]"
  >
    <!-- Card Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-md">
          {{ getInitials(record.userName) }}
        </div>
        <div>
          <div class="font-semibold text-sm text-slate-100" v-html="highlightMatch(record.userName, searchQuery)"></div>
          <div class="text-[11px] font-mono text-slate-500">{{ record.id }}</div>
        </div>
      </div>

      <div class="flex items-center">
        <UBadge
          v-if="record.pinnedPosition !== null"
          color="warning"
          variant="subtle"
          size="sm"
        >
          <Pin :size="10" class="mr-1" />
          Slot #{{ record.pinnedPosition }}
        </UBadge>
      </div>
    </div>

    <!-- Card Body -->
    <div class="flex flex-col gap-1.5 text-xs text-slate-300">
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1 text-slate-500 w-20 shrink-0">
          <Briefcase :size="12" /> Position:
        </span>
        <span class="text-slate-200 font-medium truncate" v-html="highlightMatch(record.position, searchQuery)"></span>
      </div>

      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1 text-slate-500 w-20 shrink-0">
          <MapPin :size="12" /> Location:
        </span>
        <span class="text-slate-300 truncate" v-html="highlightMatch(record.location, searchQuery)"></span>
      </div>

      <div class="flex items-center gap-6 mt-1 pt-2 border-t border-dashed border-slate-800 text-[11px]">
        <div class="flex items-center gap-1">
          <span class="text-slate-500">Age:</span>
          <span class="text-slate-200 font-mono font-medium">{{ record.age }}</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-slate-500">Start Date:</span>
          <span class="text-slate-300 font-mono">{{ record.dateStart }}</span>
        </div>
      </div>
    </div>

    <!-- Card Footer Actions with Nuxt UI UButton -->
    <div class="mt-auto pt-2 flex items-center gap-2">
      <UButton
        v-if="record.pinnedPosition !== null"
        class="flex-1 justify-center"
        size="xs"
        color="warning"
        variant="soft"
        icon="i-lucide-pin-off"
        label="Unpin"
        @click="$emit('unpin', record.id)"
      />
      <UButton
        v-else
        class="flex-1 justify-center"
        size="xs"
        color="neutral"
        variant="outline"
        icon="i-lucide-pin"
        label="Pin"
        @click="$emit('pin', record)"
      />

      <UButton
        class="flex-1 justify-center"
        size="xs"
        color="neutral"
        variant="outline"
        icon="i-lucide-edit"
        label="Edit"
        @click="$emit('edit', record)"
      />

      <UButton
        class="flex-1 justify-center"
        size="xs"
        color="error"
        variant="soft"
        icon="i-lucide-trash-2"
        label="Delete"
        @click="$emit('delete', record)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, Briefcase, MapPin } from 'lucide-vue-next';
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
