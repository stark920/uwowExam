import { ref, computed, watch } from 'vue';
import type { DataRecord, NotificationToast } from '../types';
import { generateRecordsBatch } from '../utils/mockGenerator';
import { resolvePinCollision, removePin } from './usePinning';

const STORAGE_KEY_RECORDS = 'uwow_data_records_v1';
const STORAGE_KEY_REMEMBER = 'uwow_remember_mode_v1';
const INITIAL_SEED_COUNT = 2500;
const BATCH_SIZE = 500;

export function useDataStore() {
  const rememberMode = ref<boolean>(
    localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true'
  );

  const records = ref<DataRecord[]>([]);
  const isBatchLoading = ref<boolean>(false);
  const totalLoadedCount = ref<number>(0);
  const toasts = ref<NotificationToast[]>([]);

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
      initialBatch[4].pinnedPosition = 3;
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
      addToast({
        type: 'info',
        title: 'Remember Mode Enabled',
        message: 'Your modifications and pinned positions will persist across refreshes.',
      });
    } else {
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      addToast({
        type: 'info',
        title: 'Remember Mode Disabled',
        message: 'Storage cleared. Operating in fast in-memory mode.',
      });
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

    addToast({
      type: 'success',
      title: 'Record Created',
      message: `Successfully created record for ${newRecord.userName} (${newRecord.id})`,
    });

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

    addToast({
      type: 'success',
      title: 'Record Updated',
      message: `Updated details for ${records.value[idx].userName} (${id})`,
    });

    return true;
  }

  function deleteRecord(id: string): boolean {
    const idx = records.value.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const deletedUser = records.value[idx].userName;
    records.value.splice(idx, 1);

    addToast({
      type: 'warning',
      title: 'Record Deleted',
      message: `Removed ${deletedUser} (${id}) from database.`,
    });

    return true;
  }

  function pinRecord(id: string, targetPosition: number) {
    records.value = resolvePinCollision(records.value, id, targetPosition);
    const target = records.value.find((r) => r.id === id);
    addToast({
      type: 'info',
      title: 'Row Pinned',
      message: `Pinned ${target?.userName || id} to slot #${targetPosition}. Any overlapping pins shifted down.`,
    });
  }

  function unpinRecord(id: string) {
    records.value = removePin(records.value, id);
    addToast({
      type: 'info',
      title: 'Row Unpinned',
      message: `Unpinned record #${id}. It now follows standard search/sort order.`,
    });
  }

  function resetToDefaultSeed() {
    localStorage.removeItem(STORAGE_KEY_RECORDS);
    totalLoadedCount.value = 0;
    const freshBatch = generateRecordsBatch(INITIAL_SEED_COUNT, 1);
    if (freshBatch.length > 5) {
      freshBatch[0].pinnedPosition = 1;
      freshBatch[4].pinnedPosition = 3;
    }
    records.value = freshBatch;
    totalLoadedCount.value = freshBatch.length;

    addToast({
      type: 'info',
      title: 'Database Reset',
      message: `Reset database with ${INITIAL_SEED_COUNT} clean records.`,
    });
  }

  function addToast(toast: Omit<NotificationToast, 'id' | 'timestamp'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: NotificationToast = {
      ...toast,
      id,
      timestamp: Date.now(),
    };
    toasts.value.push(newToast);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  const pinnedRecordsCount = computed(() => {
    return records.value.filter((r) => r.pinnedPosition !== null).length;
  });

  return {
    records,
    rememberMode,
    isBatchLoading,
    totalLoadedCount,
    toasts,
    pinnedRecordsCount,
    loadNextBatch,
    addRecord,
    updateRecord,
    deleteRecord,
    pinRecord,
    unpinRecord,
    resetToDefaultSeed,
    addToast,
    removeToast,
  };
}
