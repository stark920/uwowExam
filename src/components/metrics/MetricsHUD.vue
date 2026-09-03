<template>
  <div class="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-amber-500/5 transition-all">
    <div class="flex items-center justify-between mb-3.5 flex-wrap gap-2">
      <div class="flex items-center gap-2 text-sm font-bold text-slate-100">
        <Zap :size="16" class="text-amber-400" />
        <span>Part B: Search Spike Inspector (Live Metrics)</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="metrics.activeSignal" class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
          <Activity :size="12" />
          Evaluating Keystrokes...
        </span>
        <span v-else class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <CheckCircle2 :size="12" />
          Stable Buffer (300ms)
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

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3.5">
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
    </div>

    <div class="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <ShieldCheck :size="14" class="text-emerald-400 shrink-0" />
        <span>
          <strong>Mitigation Proof:</strong> Typing without debounce sends 1 request/char (~500 req/min). 
          Debounce (300ms) + <code class="bg-slate-950 px-1 py-0.5 rounded text-indigo-300 font-mono text-[11px]">AbortController</code> cuts calls by <strong class="text-emerald-400">80%+</strong>.
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
import type { SearchMetricsState } from '../../types';

defineProps<{
  metrics: SearchMetricsState;
}>();

defineEmits<{
  (e: 'reset:metrics'): void;
}>();
</script>
