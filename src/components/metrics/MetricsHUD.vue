<template>
  <div class="metrics-hud glass-panel">
    <div class="hud-header">
      <div class="hud-title">
        <Zap :size="16" class="text-amber-400" />
        <span class="font-display font-semibold">Part B: Search Spike Inspector (Live Metrics)</span>
      </div>
      <div class="hud-badges">
        <span v-if="metrics.activeSignal" class="badge badge-amber animate-pulse">
          <Activity :size="12" />
          Evaluating Keystrokes...
        </span>
        <span v-else class="badge badge-emerald">
          <CheckCircle2 :size="12" />
          Stable Buffer (300ms)
        </span>
        <button @click="$emit('reset:metrics')" class="hud-reset-btn" title="Reset metrics counter">
          <RotateCcw :size="12" />
          Reset
        </button>
      </div>
    </div>

    <div class="hud-grid">
      <div class="hud-card">
        <div class="metric-label">Total Keystrokes</div>
        <div class="metric-value font-mono text-indigo-400">{{ metrics.totalKeystrokes }}</div>
        <div class="metric-desc">Unthrottled keypress events</div>
      </div>

      <div class="hud-card">
        <div class="metric-label">Dispatched Searches</div>
        <div class="metric-value font-mono text-emerald-400">{{ metrics.debouncedExecutions }}</div>
        <div class="metric-desc">300ms pause triggers</div>
      </div>

      <div class="hud-card">
        <div class="metric-label">Aborted In-Flight</div>
        <div class="metric-value font-mono text-rose-400">{{ metrics.abortedRequests }}</div>
        <div class="metric-desc">Cancelled via AbortController</div>
      </div>

      <div class="hud-card highlighted-card">
        <div class="metric-label">API Load Reduction</div>
        <div class="metric-value font-mono text-amber-300">
          {{ metrics.trafficReductionPercent }}%
        </div>
        <div class="reduction-bar-container">
          <div class="reduction-bar" :style="{ width: `${metrics.trafficReductionPercent}%` }"></div>
        </div>
      </div>
    </div>

    <div class="hud-footer">
      <div class="explanation-tag">
        <ShieldCheck :size="14" class="text-emerald-400" />
        <span>
          <strong>Mitigation Proof:</strong> Typing without debounce sends 1 request per character (~500 req/min). 
          Debounce (300ms) + <code>AbortController</code> cuts API calls by <strong>80%+</strong> and eliminates race conditions.
        </span>
      </div>
      <div class="latency-tag font-mono">
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

<style scoped>
.metrics-hud {
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(15, 23, 42, 0.85);
  box-shadow: 0 0 25px rgba(245, 158, 11, 0.08);
  animation: slideUp 0.25s ease-out;
}

.hud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hud-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #ffffff;
}

.hud-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hud-reset-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.hud-reset-btn:hover {
  background: rgba(51, 65, 85, 0.9);
  color: var(--text-primary);
}

.hud-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.hud-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
}

.highlighted-card {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
}

.metric-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.metric-desc {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.reduction-bar-container {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 0.35rem;
}

.reduction-bar {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #10b981);
  transition: width 0.3s ease;
}

.hud-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.76rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.explanation-tag {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1;
  min-width: 250px;
}

.explanation-tag code {
  background: rgba(0, 0, 0, 0.4);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  color: #818cf8;
  font-family: var(--font-mono);
}

.latency-tag {
  color: var(--text-muted);
  font-size: 0.72rem;
}

.text-amber-400 { color: #fbbf24; }
.text-amber-300 { color: #fcd34d; }
.text-indigo-400 { color: #818cf8; }
.text-emerald-400 { color: #34d399; }
.text-rose-400 { color: #fb7185; }
</style>
