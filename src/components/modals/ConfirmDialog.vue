<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content glass-panel confirm-dialog">
      <div class="dialog-body">
        <div class="dialog-icon" :class="`icon-${type}`">
          <AlertTriangle v-if="type === 'danger'" :size="24" />
          <HelpCircle v-else :size="24" />
        </div>
        <div class="dialog-content">
          <h3 class="dialog-title font-display">{{ title }}</h3>
          <p class="dialog-message">{{ message }}</p>
        </div>
      </div>

      <div class="dialog-footer">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button
          type="button"
          class="btn"
          :class="type === 'danger' ? 'btn-outline-danger' : 'btn-primary'"
          @click="$emit('confirm')"
        >
          {{ confirmText || (type === 'danger' ? 'Delete' : 'Confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, HelpCircle } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  type?: 'danger' | 'info';
  title: string;
  message: string;
  confirmText?: string;
}>();

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<style scoped>
.confirm-dialog {
  max-width: 440px;
  padding: 1.5rem;
}

.dialog-body {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.dialog-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-danger {
  background: var(--rose-bg);
  color: var(--rose-text);
  border: 1px solid var(--rose-border);
}

.icon-info {
  background: var(--indigo-bg);
  color: var(--indigo-text);
  border: 1px solid var(--indigo-border);
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.dialog-message {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}
</style>
