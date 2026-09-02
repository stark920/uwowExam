<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass-panel">
      <div class="modal-header">
        <div class="header-info">
          <div class="modal-icon" :class="isEditMode ? 'bg-indigo' : 'bg-emerald'">
            <Edit v-if="isEditMode" :size="18" />
            <UserPlus v-else :size="18" />
          </div>
          <div>
            <h2 class="modal-title font-display">
              {{ isEditMode ? `Edit Record #${initialData?.id}` : 'Create New Record' }}
            </h2>
            <p class="modal-subtitle">
              {{ isEditMode ? 'Update employee attributes' : 'Fill in employee details with type validation' }}
            </p>
          </div>
        </div>
        <button @click="$emit('close')" class="modal-close-btn">
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label" for="userName">
            User Name <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <User :size="15" class="input-icon" />
            <input
              id="userName"
              v-model.trim="form.userName"
              type="text"
              class="input-control has-icon"
              :class="{ 'input-error': errors.userName }"
              placeholder="e.g. Elena Rostova"
            />
          </div>
          <span v-if="errors.userName" class="error-msg">{{ errors.userName }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="position">
            Position / Title <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <Briefcase :size="15" class="input-icon" />
            <input
              id="position"
              v-model.trim="form.position"
              type="text"
              class="input-control has-icon"
              :class="{ 'input-error': errors.position }"
              placeholder="e.g. Senior Frontend Architect"
            />
          </div>
          <span v-if="errors.position" class="error-msg">{{ errors.position }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="location">
            Location <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <MapPin :size="15" class="input-icon" />
            <input
              id="location"
              v-model.trim="form.location"
              type="text"
              class="input-control has-icon"
              :class="{ 'input-error': errors.location }"
              placeholder="e.g. Singapore, SG"
            />
          </div>
          <span v-if="errors.location" class="error-msg">{{ errors.location }}</span>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label" for="age">
              Age (18 - 100) <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <Hash :size="15" class="input-icon" />
              <input
                id="age"
                v-model.number="form.age"
                type="number"
                min="18"
                max="100"
                class="input-control has-icon"
                :class="{ 'input-error': errors.age }"
                placeholder="28"
              />
            </div>
            <span v-if="errors.age" class="error-msg">{{ errors.age }}</span>
          </div>

          <div class="form-group flex-1">
            <label class="form-label" for="dateStart">
              Start Date (YYYY-MM-DD) <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <Calendar :size="15" class="input-icon" />
              <input
                id="dateStart"
                v-model="form.dateStart"
                type="date"
                class="input-control has-icon"
                :class="{ 'input-error': errors.dateStart }"
              />
            </div>
            <span v-if="errors.dateStart" class="error-msg">{{ errors.dateStart }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            <Check :size="15" />
            <span>{{ isEditMode ? 'Save Changes' : 'Create Record' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { User, Briefcase, MapPin, Hash, Calendar, X, Check, Edit, UserPlus } from 'lucide-vue-next';
import type { DataRecord } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  initialData?: DataRecord | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit:add', data: Omit<DataRecord, 'id' | 'createdAt' | 'updatedAt' | 'pinnedPosition'>): void;
  (e: 'request:update-confirm', id: string, updates: Partial<DataRecord>): void;
}>();

const isEditMode = computed(() => !!props.initialData);

const form = reactive({
  userName: '',
  position: '',
  location: '',
  age: 28,
  dateStart: new Date().toISOString().slice(0, 10),
});

const errors = reactive({
  userName: '',
  position: '',
  location: '',
  age: '',
  dateStart: '',
});

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.userName = newData.userName;
      form.position = newData.position;
      form.location = newData.location;
      form.age = newData.age;
      form.dateStart = newData.dateStart;
    } else {
      form.userName = '';
      form.position = '';
      form.location = '';
      form.age = 28;
      form.dateStart = new Date().toISOString().slice(0, 10);
    }
    clearErrors();
  },
  { immediate: true }
);

function clearErrors() {
  errors.userName = '';
  errors.position = '';
  errors.location = '';
  errors.age = '';
  errors.dateStart = '';
}

function validateForm(): boolean {
  clearErrors();
  let isValid = true;

  if (!form.userName || form.userName.trim().length < 2) {
    errors.userName = 'Name must be at least 2 characters';
    isValid = false;
  }

  if (!form.position || form.position.trim().length === 0) {
    errors.position = 'Position is required';
    isValid = false;
  }

  if (!form.location || form.location.trim().length === 0) {
    errors.location = 'Location is required';
    isValid = false;
  }

  if (!form.age || isNaN(form.age) || form.age < 18 || form.age > 100) {
    errors.age = 'Age must be an integer between 18 and 100';
    isValid = false;
  }

  if (!form.dateStart || !/^\d{4}-\d{2}-\d{2}$/.test(form.dateStart)) {
    errors.dateStart = 'Valid date (YYYY-MM-DD) is required';
    isValid = false;
  }

  return isValid;
}

function handleSubmit() {
  if (!validateForm()) return;

  if (isEditMode.value && props.initialData) {
    emit('request:update-confirm', props.initialData.id, {
      userName: form.userName,
      position: form.position,
      location: form.location,
      age: form.age,
      dateStart: form.dateStart,
    });
  } else {
    emit('submit:add', {
      userName: form.userName,
      position: form.position,
      location: form.location,
      age: form.age,
      dateStart: form.dateStart,
    });
    emit('close');
  }
}
</script>

<style scoped>
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

.bg-indigo { background: var(--accent-gradient); }
.bg-emerald { background: linear-gradient(135deg, #10b981, #059669); }

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-subtitle {
  font-size: 0.75rem;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-1 { flex: 1; }

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.required {
  color: var(--rose-text);
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

.input-error {
  border-color: var(--rose-text) !important;
  box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2) !important;
}

.error-msg {
  font-size: 0.72rem;
  color: var(--rose-text);
  margin-top: 0.15rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
  margin-top: 0.5rem;
}
</style>
