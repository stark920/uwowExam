<template>
  <UModal :open="isOpen" @update:open="onOpenChange">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Pin :size="18" />
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-100">Pin Record to Relative Slot</h2>
                <p class="text-xs text-slate-400">Assign a fixed 1-based relative display position</p>
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

        <div class="flex flex-col gap-4">
          <!-- Target Record Preview -->
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div class="font-semibold text-sm text-slate-100">{{ record?.userName }}</div>
            <div class="text-xs font-mono text-slate-400 mt-0.5">{{ record?.id }} &bull; {{ record?.position }}</div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1" for="targetSlot">
              Target Relative Display Slot (1-Based):
            </label>
            <UInput
              id="targetSlot"
              v-model.number="slotPosition"
              type="number"
              icon="i-lucide-hash"
              class="w-full"
              placeholder="e.g. 1"
            />
          </div>

          <!-- Quick Slot Presets -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs text-slate-400 font-medium">Quick Slots:</span>
            <UButton
              v-for="preset in [1, 2, 3, 5, 10]"
              :key="preset"
              size="xs"
              :variant="slotPosition === preset ? 'solid' : 'outline'"
              :color="slotPosition === preset ? 'warning' : 'neutral'"
              :label="`#${preset}`"
              @click="slotPosition = preset"
            />
          </div>

          <div class="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 leading-relaxed">
            <Info :size="14" class="shrink-0 mt-0.5" />
            <span>
              <strong>Fixed on Top:</strong> Pinned rows remain permanently locked at the top of your view. If slot #{{ slotPosition }} is occupied, other pins at or after slot #{{ slotPosition }} shift down (+1).
            </span>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              label="Cancel"
              @click="$emit('close')"
            />
            <UButton
              color="warning"
              icon="i-lucide-pin"
              :label="`Lock to Slot #${slotPosition}`"
              @click="handleConfirm"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Pin, Info } from 'lucide-vue-next';
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

function onOpenChange(val: boolean) {
  if (!val) emit('close');
}

function handleConfirm() {
  if (props.record && slotPosition.value >= 1) {
    emit('confirm:pin', props.record.id, slotPosition.value);
    emit('close');
  }
}
</script>
