<template>
  <header class="app-header glass-panel">
    <div class="header-left">
      <div class="logo-container">
        <div class="logo-icon">
          <Layers :size="20" class="logo-svg" />
        </div>
        <div>
          <h1 class="app-title font-display">UWow Data Engine</h1>
          <p class="app-subtitle">Vue 3 • TypeScript • 10M Virtual Scroll Architecture</p>
        </div>
      </div>

      <div class="header-stats">
        <span class="stat-pill badge-indigo">
          <Database :size="13" />
          {{ totalRecords.toLocaleString() }} Loaded
        </span>
        <span v-if="pinnedCount > 0" class="stat-pill badge-pinned">
          <Pin :size="13" />
          {{ pinnedCount }} Pinned
        </span>
        <span v-if="isBatchLoading" class="stat-pill badge-amber animate-pulse">
          <RefreshCw :size="13" class="spin-icon" />
          Fetching +500 Rows...
        </span>
      </div>
    </div>

    <div class="header-right">
      <!-- Remember Mode Checkbox Toggle -->
      <label class="toggle-control" title="Toggle localStorage persistence for CRUD and pins">
        <input
          type="checkbox"
          :checked="rememberMode"
          @change="$emit('update:rememberMode', ($event.target as HTMLInputElement).checked)"
        />
        <span class="toggle-slider"></span>
        <span class="toggle-label">
          Remember Mode
          <span :class="['mode-dot', rememberMode ? 'active' : '']"></span>
        </span>
      </label>

      <!-- Metrics HUD Toggle -->
      <button
        class="btn btn-secondary btn-sm"
        :class="{ 'btn-active': showMetricsHUD }"
        @click="$emit('toggle:metricsHUD')"
        title="Toggle Part B Search Spike Inspector HUD"
      >
        <Zap :size="15" :class="{ 'text-amber-400': showMetricsHUD }" />
        <span>Part B Inspector</span>
      </button>

      <!-- Reset Database -->
      <button
        class="btn btn-secondary btn-sm"
        @click="$emit('reset:data')"
        title="Reset dataset with fresh records"
      >
        <RefreshCw :size="14" />
        <span>Reset Seed</span>
      </button>

      <!-- Add New Record Button -->
      <button class="btn btn-primary btn-sm" @click="$emit('open:addModal')">
        <Plus :size="16" />
        <span>Add Record</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Layers, Database, Pin, RefreshCw, Zap, Plus } from 'lucide-vue-next';

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

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  margin-bottom: 1.25rem;
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: var(--accent-glow);
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app-subtitle {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-full);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
}

.btn-active {
  background: rgba(99, 102, 241, 0.25);
  border-color: var(--accent-primary);
  color: #ffffff;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.toggle-control {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  background: rgba(30, 41, 59, 0.6);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  transition: all 0.2s ease;
}

.toggle-control:hover {
  border-color: var(--border-active);
}

.toggle-control input {
  display: none;
}

.toggle-slider {
  width: 28px;
  height: 16px;
  background: rgba(71, 85, 105, 0.8);
  border-radius: 999px;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle-control input:checked + .toggle-slider {
  background: var(--accent-primary);
}

.toggle-control input:checked + .toggle-slider::after {
  transform: translateX(12px);
}

.toggle-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.mode-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
}

.mode-dot.active {
  background: #34d399;
  box-shadow: 0 0 6px #34d399;
}

@media (max-width: 900px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }
  .header-left, .header-right {
    justify-content: space-between;
  }
}
</style>
