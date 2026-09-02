<template>
  <div class="toast-container" aria-live="polite">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-item"
      :class="`toast-${toast.type}`"
    >
      <div class="toast-icon">
        <CheckCircle2 v-if="toast.type === 'success'" :size="18" />
        <AlertTriangle v-else-if="toast.type === 'warning'" :size="18" />
        <AlertCircle v-else-if="toast.type === 'error'" :size="18" />
        <Info v-else :size="18" />
      </div>

      <div class="toast-content">
        <div class="toast-title">{{ toast.title }}</div>
        <div class="toast-msg">{{ toast.message }}</div>
      </div>

      <button @click="$emit('dismiss', toast.id)" class="toast-close-btn">
        <X :size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-vue-next';
import type { NotificationToast } from '../../types';

defineProps<{
  toasts: NotificationToast[];
}>();

defineEmits<{
  (e: 'dismiss', id: string): void;
}>();
</script>

<style scoped>
.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid var(--border-glow);
  padding: 0.75rem 0.95rem;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  animation: slideInRight 0.25s ease-out;
}

.toast-icon {
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.toast-success .toast-icon { color: #34d399; }
.toast-warning .toast-icon { color: #fbbf24; }
.toast-error .toast-icon { color: #fb7185; }
.toast-info .toast-icon { color: #818cf8; }

.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.toast-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
}

.toast-msg {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

.toast-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.15rem;
  border-radius: 4px;
}

.toast-close-btn:hover {
  color: var(--text-primary);
}
</style>
