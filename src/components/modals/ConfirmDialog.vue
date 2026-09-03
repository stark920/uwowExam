<template>
  <UModal :open="isOpen" @update:open="onOpenChange">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                :class="type === 'danger' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'"
              >
                <AlertTriangle v-if="type === 'danger'" :size="18" />
                <HelpCircle v-else :size="18" />
              </div>
              <h3 class="text-base font-bold text-slate-100">{{ title }}</h3>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="sm"
              @click="$emit('cancel')"
            />
          </div>
        </template>

        <p class="text-xs text-slate-300 leading-relaxed py-1">{{ message }}</p>

        <template #footer>
          <div class="flex items-center justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              label="Cancel"
              @click="$emit('cancel')"
            />
            <UButton
              :color="type === 'danger' ? 'error' : 'primary'"
              :label="confirmText || (type === 'danger' ? 'Delete' : 'Confirm')"
              @click="$emit('confirm')"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
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

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

function onOpenChange(val: boolean) {
  if (!val) emit('cancel');
}
</script>
