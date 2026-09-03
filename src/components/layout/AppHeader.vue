<template>
  <header class="flex items-center justify-between p-3.5 sm:px-6 rounded-2xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-xl shadow-xl flex-wrap gap-4">
    <!-- Header Left -->
    <div class="flex items-center gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Layers :size="20" />
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            UWow Data Engine
          </h1>
          <p class="text-xs text-slate-400">Vue 3 &bull; Nuxt UI &bull; Virtual Scroll &bull; Sticky Pinned Rows</p>
        </div>
      </div>

      <!-- Stats badges with Nuxt UI UBadge -->
      <div class="flex items-center gap-2 flex-wrap">
        <UBadge color="primary" variant="subtle" size="md">
          <Database :size="12" class="mr-1" />
          {{ totalRecords.toLocaleString() }} Loaded
        </UBadge>
        <UBadge v-if="pinnedCount > 0" color="warning" variant="subtle" size="md">
          <Pin :size="12" class="mr-1" />
          {{ pinnedCount }} Pinned
        </UBadge>
        <UBadge v-if="isBatchLoading" color="warning" variant="subtle" size="md" class="animate-pulse">
          <RefreshCw :size="12" class="mr-1 animate-spin" />
          Fetching +500 Rows...
        </UBadge>
      </div>
    </div>

    <!-- Header Right Controls with Nuxt UI Components -->
    <div class="flex items-center gap-3 flex-wrap">
      <!-- Remember Mode Switch -->
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
        <USwitch
          size="sm"
          :model-value="rememberMode"
          @update:model-value="$emit('update:rememberMode', $event)"
        />
        <span class="flex items-center gap-1.5 font-medium">
          Remember Mode
          <span class="w-1.5 h-1.5 rounded-full" :class="rememberMode ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-500'"></span>
        </span>
      </div>

      <!-- Metrics HUD Toggle -->
      <UButton
        size="sm"
        :color="showMetricsHUD ? 'primary' : 'neutral'"
        :variant="showMetricsHUD ? 'soft' : 'outline'"
        icon="i-lucide-zap"
        label="Part B Inspector"
        @click="$emit('toggle:metricsHUD')"
      />

      <!-- Reset Database -->
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        label="Reset Seed"
        @click="$emit('reset:data')"
      />

      <!-- Add New Record Button -->
      <UButton
        size="sm"
        color="primary"
        icon="i-lucide-plus"
        label="Add Record"
        @click="$emit('open:addModal')"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Layers, Database, Pin, RefreshCw } from 'lucide-vue-next';

defineProps<{
  totalRecords: number;
  pinnedCount: number;
  isBatchLoading: boolean;
  rememberMode: boolean;
  showMetricsHUD: boolean;
}>();

defineEmits<{
  (e: 'update:rememberMode', val: boolean): void;
  (e: 'toggle:metricsHUD'): void;
  (e: 'reset:data'): void;
  (e: 'open:addModal'): void;
}>();
</script>
