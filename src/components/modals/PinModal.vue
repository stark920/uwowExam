<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass-panel pin-modal">
      <div class="modal-header">
        <div class="header-info">
          <div class="modal-icon bg-amber">
            <Pin :size="18" />
          </div>
          <div>
            <h2 class="modal-title font-display">Pin Record to Relative Slot</h2>
            <p class="modal-subtitle">Assign a fixed 1-based relative display position</p>
          </div>
        </div>
        <button @click="$emit('close')" class="modal-close-btn">
          <X :size="18" />
        </button>
      </div>

      <div class="modal-body">
        <div class="target-record-preview">
          <div class="preview-name">{{ record?.userName }}</div>
          <div class="preview-meta font-mono">{{ record?.id }} • {{ record?.position }}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="targetSlot">
            Target Relative Display Slot (1-Based):
          </label>
          <div class="input-wrapper">
            <Hash :size="15" class="input-icon" />
            <input
              id="targetSlot"
              v-model.number="slotPosition"
              type="number"
              min="1"
              max="9999"
              class="input-control has-icon"
              placeholder="e.g. 1"
            />
          </div>
        </div>

        <!-- Quick Slot Presets -->
        <div class="presets-row">
          <span class="preset-label">Quick Slots:</span>
          <button
            v-for="preset in [1, 2, 3, 5, 10]"
            :key="preset"
            type="button"
            class="btn-preset"
            :class="{ active: slotPosition === preset }"
            @click="slotPosition = preset"
          >
            #{{ preset }}
          </button>
        </div>

        <div class="pin-rule-notice">
          <Info :size="14" class="notice-icon" />
          <span>
            <strong>Collision Rule:</strong> If slot #{{ slotPosition }} is occupied by another pinned record, 
            existing pins at or after slot #{{ slotPosition }} will automatically shift down (+1).
          </span>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn btn-secondary">
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary btn-pin-confirm"
          @click="handleConfirm"
        >
          <Pin :size="14" />
          <span>Lock to Slot #{{ slotPosition }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Pin, X, Hash, Info } from 'lucide-vue-next';
import type { DataRecord } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  record: DataRecord | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm:pin', recordId: string, targetSlot: number): void;
}>();

const slotPosition = ref<number>(1);

watch(
  () => props.record,
  (newRec) => {
    if (newRec && newRec.pinnedPosition !== null) {
      slotPosition.value = newRec.pinnedPosition;
    } else {
      slotPosition.value = 1;
    }
  },
  { immediate: true }
);

function handleConfirm() {
  if (props.record && slotPosition.value >= 1) {
    emit('confirm:pin', props.record.id, slotPosition.value);
    emit('close');
  }
}
</script>

<style scoped>
.pin-modal {
  max-width: 460px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(15, 23, 42, 0.95);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.bg-amber {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-subtitle {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.target-record-preview {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.85rem;
}

.preview-name {
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.preview-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-muted);
  pointer-events: none;
}

.has-icon {
  padding-left: 2.3rem;
}

.presets-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.preset-label {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.btn-preset {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-preset:hover {
  background: rgba(51, 65, 85, 0.9);
  color: var(--text-primary);
  border-color: var(--border-active);
}

.btn-preset.active {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fcd34d;
}

.pin-rule-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.85rem;
  font-size: 0.76rem;
  color: #fcd34d;
  line-height: 1.4;
}

.notice-icon {
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
}

.btn-pin-confirm {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.btn-pin-confirm:hover {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
}
</style>
