<template>
  <div class="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-amber-500/5 transition-all">
    <div class="flex items-center justify-between mb-3.5 flex-wrap gap-2">
      <div class="flex items-center gap-2 text-sm font-bold text-slate-100">
        <Zap :size="16" class="text-amber-400" />
        <span>Performance & Memory Inspector (Part B & C)</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="metrics.activeSignal" class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
          <Activity :size="12" />
          Evaluating Keystrokes...
        </span>
        <span v-else class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <CheckCircle2 :size="12" />
          Debounce (300ms) Active
        </span>
        <button
          @click="$emit('reset:metrics')"
          class="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-slate-100 text-[11px] font-medium px-2 py-1 rounded-md transition-colors cursor-pointer"
          title="Reset metrics counter"
        >
          <RotateCcw :size="12" />
          Reset
        </button>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3.5">
      <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
        <div class="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Total Keystrokes</div>
        <div class="text-xl font-bold font-mono text-indigo-400 mb-0.5">{{ metrics.totalKeystrokes }}</div>
        <div class="text-[11px] text-slate-500">Unthrottled keypresses</div>
      </div>

      <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
        <div class="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Dispatched Searches</div>
        <div class="text-xl font-bold font-mono text-emerald-400 mb-0.5">{{ metrics.debouncedExecutions }}</div>
        <div class="text-[11px] text-slate-500">300ms pause triggers</div>
      </div>

      <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
        <div class="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Aborted In-Flight</div>
        <div class="text-xl font-bold font-mono text-rose-400 mb-0.5">{{ metrics.abortedRequests }}</div>
        <div class="text-[11px] text-slate-500">Via AbortController</div>
      </div>

      <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-col">
        <div class="text-[11px] uppercase tracking-wider font-semibold text-amber-400 mb-1">API Load Reduction</div>
        <div class="text-xl font-bold font-mono text-amber-300 mb-0.5">{{ metrics.trafficReductionPercent }}%</div>
        <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
          <div class="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300" :style="{ width: `${metrics.trafficReductionPercent}%` }"></div>
        </div>
      </div>

      <!-- RAM Capping & Delta Storage Stats -->
      <div class="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 flex flex-col">
        <div class="text-[11px] uppercase tracking-wider font-semibold text-indigo-300 mb-1">RAM Capped Buffer</div>
        <div class="text-xl font-bold font-mono text-indigo-200 mb-0.5">
          {{ memoryStats?.activeRamCount || 500 }} <span class="text-xs font-normal text-slate-400">/ {{ memoryStats?.maxRamCap || 2500 }}</span>
        </div>
        <div class="text-[11px] text-slate-400 font-mono">
          Delta payload: {{ ((memoryStats?.deltaPayloadBytes || 120) / 1024).toFixed(2) }} KB
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <ShieldCheck :size="14" class="text-emerald-400 shrink-0" />
        <span>
          <strong>RAM & Storage Protection:</strong> RAM is capped at a sliding buffer (≤2,500 rows). Remember mode writes only delta changes (&lt;5 KB), eliminating `localStorage` quota errors.
        </span>
      </div>
      <div class="text-[11px] font-mono text-slate-500">
        Latency: {{ metrics.lastSearchLatencyMs }}ms
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Zap, Activity, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-vue-next';
import type { SearchMetricsState, MemoryStats } from '../../types';

defineProps<{
  metrics: SearchMetricsState;
  memoryStats?: MemoryStats;
}>();

defineEmits<{
  (e: 'reset:metrics'): void;
}>();
</script>
