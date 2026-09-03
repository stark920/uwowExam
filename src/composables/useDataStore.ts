import { ref, computed, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import type { DataRecord } from '../types';
import { generateRecordsBatch } from '../utils/mockGenerator';
import { resolvePinCollision, removePin } from './usePinning';

const STORAGE_KEY_RECORDS = 'uwow_data_records_v1';
const STORAGE_KEY_REMEMBER = 'uwow_remember_mode_v1';
const INITIAL_SEED_COUNT = 500;
const BATCH_SIZE = 500;
const TOTAL_DATASET_TARGET = 10_000_000;

export function useDataStore() {
  const toast = useToast();

  const rememberMode = ref<boolean>(
    localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true'
  );

  const records = ref<DataRecord[]>([]);
  const isBatchLoading = ref<boolean>(false);
  const totalLoadedCount = ref<number>(0);
  const totalDatasetCount = ref<number>(TOTAL_DATASET_TARGET);

  function notify(type: 'success' | 'warning' | 'error' | 'info', title: string, description: string) {
    const iconMap = {
      success: 'i-lucide-check-circle-2',
      warning: 'i-lucide-triangle-alert',
      error: 'i-lucide-circle-alert',
      info: 'i-lucide-info',
    };

    toast.add({
      title,
      description,
      color: type,
      icon: iconMap[type] || 'i-lucide-info',
    });
  }

  function initData() {
    if (rememberMode.value) {
      const cached = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            records.value = parsed;
            totalLoadedCount.value = parsed.length;
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached records', e);
        }
      }
    }

    const initialBatch = generateRecordsBatch(INITIAL_SEED_COUNT, 1);
    if (initialBatch.length > 5) {
      initialBatch[0].pinnedPosition = 1;
      initialBatch[2].pinnedPosition = 3;
    }
    records.value = initialBatch;
    totalLoadedCount.value = initialBatch.length;
  }

  initData();

  watch(
    records,
    (newVal) => {
      if (rememberMode.value) {
        try {
          const sliceToStore = newVal.slice(0, 5000);
          localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(sliceToStore));
        } catch (e) {
          console.warn('LocalStorage quota limit reached for records', e);
        }
      }
    },
    { deep: true }
  );

  watch(rememberMode, (newVal) => {
    localStorage.setItem(STORAGE_KEY_REMEMBER, newVal ? 'true' : 'false');
    if (newVal) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records.value.slice(0, 5000)));
      notify('info', 'Remember Mode Enabled', 'Your modifications and pinned positions will persist across refreshes.');
    } else {
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      notify('info', 'Remember Mode Disabled', 'Storage cleared. Operating in fast in-memory mode.');
    }
  });

  function loadNextBatch(batchSize = BATCH_SIZE) {
    if (isBatchLoading.value) return;

    isBatchLoading.value = true;
    setTimeout(() => {
      const nextBatch = generateRecordsBatch(batchSize, totalLoadedCount.value + 1);
      records.value = [...records.value, ...nextBatch];
      totalLoadedCount.value += batchSize;
      isBatchLoading.value = false;
    }, 150);
  }

  function addRecord(data: Omit<DataRecord, 'id' | 'createdAt' | 'updatedAt' | 'pinnedPosition'>): DataRecord {
    const newId = `REC-${String(totalLoadedCount.value + 1).padStart(6, '0')}`;
    totalLoadedCount.value++;

    const newRecord: DataRecord = {
      ...data,
      id: newId,
      pinnedPosition: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    records.value.unshift(newRecord);
    notify('success', 'Record Created', `Successfully created record for ${newRecord.userName} (${newRecord.id})`);

    return newRecord;
  }

  function updateRecord(id: string, updates: Partial<Omit<DataRecord, 'id' | 'createdAt'>>): boolean {
    const idx = records.value.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const oldRecord = records.value[idx];
    records.value[idx] = {
      ...oldRecord,
      ...updates,
      updatedAt: Date.now(),
    };

    notify('success', 'Record Updated', `Updated details for ${records.value[idx].userName} (${id})`);

    return true;
  }

  function deleteRecord(id: string): boolean {
    const idx = records.value.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const deletedUser = records.value[idx].userName;
    records.value.splice(idx, 1);
    notify('warning', 'Record Deleted', `Removed ${deletedUser} (${id}) from database.`);

    return true;
  }

  function pinRecord(id: string, targetPosition: number) {
    records.value = resolvePinCollision(records.value, id, targetPosition);
    const target = records.value.find((r) => r.id === id);
    notify('info', 'Row Pinned', `Pinned ${target?.userName || id} to slot #${targetPosition}. Any overlapping pins shifted down.`);
  }

  function unpinRecord(id: string) {
    records.value = removePin(records.value, id);
    notify('info', 'Row Unpinned', `Unpinned record #${id}. It now follows standard search/sort order.`);
  }

  function resetToDefaultSeed() {
    localStorage.removeItem(STORAGE_KEY_RECORDS);
    totalLoadedCount.value = 0;
    const freshBatch = generateRecordsBatch(INITIAL_SEED_COUNT, 1);
    if (freshBatch.length > 5) {
      freshBatch[0].pinnedPosition = 1;
      freshBatch[2].pinnedPosition = 3;
    }
    records.value = freshBatch;
    totalLoadedCount.value = freshBatch.length;

    notify('info', 'Database Reset', `Reset database with ${INITIAL_SEED_COUNT} clean records.`);
  }

  const pinnedRecordsCount = computed(() => {
    return records.value.filter((r) => r.pinnedPosition !== null).length;
  });

  return {
    records,
    rememberMode,
    isBatchLoading,
    totalLoadedCount,
    totalDatasetCount,
    pinnedRecordsCount,
    loadNextBatch,
    addRecord,
    updateRecord,
    deleteRecord,
    pinRecord,
    unpinRecord,
    resetToDefaultSeed,
    notify,
  };
}
