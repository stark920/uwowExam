<template>
  <UModal :open="isOpen" @update:open="onOpenChange">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
                :class="isEditMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
              >
                <Edit v-if="isEditMode" :size="18" />
                <UserPlus v-else :size="18" />
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-100">
                  {{ isEditMode ? `Edit Record #${initialData?.id}` : 'Create New Record' }}
                </h2>
                <p class="text-xs text-slate-400">
                  {{ isEditMode ? 'Update employee attributes' : 'Fill in employee details with type validation' }}
                </p>
              </div>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="sm"
              @click="$emit('close')"
            />
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1" for="userName">
              User Name <span class="text-rose-400">*</span>
            </label>
            <UInput
              id="userName"
              v-model.trim="form.userName"
              icon="i-lucide-user"
              placeholder="e.g. Elena Rostova"
              class="w-full"
              :color="errors.userName ? 'error' : 'neutral'"
            />
            <span v-if="errors.userName" class="text-[11px] text-rose-400 mt-1 block">{{ errors.userName }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1" for="position">
              Position / Title <span class="text-rose-400">*</span>
            </label>
            <UInput
              id="position"
              v-model.trim="form.position"
              icon="i-lucide-briefcase"
              placeholder="e.g. Senior Frontend Architect"
              class="w-full"
              :color="errors.position ? 'error' : 'neutral'"
            />
            <span v-if="errors.position" class="text-[11px] text-rose-400 mt-1 block">{{ errors.position }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1" for="location">
              Location <span class="text-rose-400">*</span>
            </label>
            <UInput
              id="location"
              v-model.trim="form.location"
              icon="i-lucide-map-pin"
              placeholder="e.g. Singapore, SG"
              class="w-full"
              :color="errors.location ? 'error' : 'neutral'"
            />
            <span v-if="errors.location" class="text-[11px] text-rose-400 mt-1 block">{{ errors.location }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1" for="age">
                Age (18 - 100) <span class="text-rose-400">*</span>
              </label>
              <UInput
                id="age"
                v-model.number="form.age"
                type="number"
                icon="i-lucide-hash"
                placeholder="28"
                class="w-full"
                :color="errors.age ? 'error' : 'neutral'"
              />
              <span v-if="errors.age" class="text-[11px] text-rose-400 mt-1 block">{{ errors.age }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1" for="dateStart">
                Start Date (YYYY-MM-DD) <span class="text-rose-400">*</span>
              </label>
              <UInput
                id="dateStart"
                v-model="form.dateStart"
                type="date"
                icon="i-lucide-calendar"
                class="w-full"
                :color="errors.dateStart ? 'error' : 'neutral'"
              />
              <span v-if="errors.dateStart" class="text-[11px] text-rose-400 mt-1 block">{{ errors.dateStart }}</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
            <UButton
              color="neutral"
              variant="outline"
              label="Cancel"
              @click="$emit('close')"
            />
            <UButton
              type="submit"
              color="primary"
              icon="i-lucide-check"
              :label="isEditMode ? 'Save Changes' : 'Create Record'"
            />
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { Edit, UserPlus } from 'lucide-vue-next';
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

function onOpenChange(val: boolean) {
  if (!val) emit('close');
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
