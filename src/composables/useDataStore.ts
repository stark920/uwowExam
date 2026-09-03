import { ref, computed, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import type { DataRecord, DeltaStoragePayload, MemoryStats } from '../types';
import { generateRecordsBatch } from '../utils/mockGenerator';
import { resolvePinCollision, removePin } from './usePinning';

const STORAGE_KEY_DELTAS = 'uwow_deltas_v1';
const STORAGE_KEY_REMEMBER = 'uwow_remember_mode_v1';
const INITIAL_SEED_COUNT = 500;
const BATCH_SIZE = 500;
const MAX_RAM_CAP = 2500; // Sliding buffer capacity (max active rows in RAM)
const TOTAL_DATASET_TARGET = 10_000_000;

export function useDataStore() {
  const toast = useToast();

  const rememberMode = ref<boolean>(
    localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true'
  );

  // Delta-only persistence state (Pins, Edits, Deletions, Additions)
  const deltas = ref<DeltaStoragePayload>({
    pins: {},
    edits: {},
    deletedIds: [],
    createdRecords: [],
    version: 1,
  });

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

  // Hydrates a raw batch of records with active user deltas (edits, pins, deletions)
  function applyDeltasToBatch(batch: DataRecord[]): DataRecord[] {
    const deletedSet = new Set(deltas.value.deletedIds);
    const result: DataRecord[] = [];

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      if (deletedSet.has(item.id)) continue;

      let record = item;
      const edit = deltas.value.edits[item.id];
      if (edit) {
        record = { ...record, ...edit };
      }

      if (deltas.value.pins[item.id] !== undefined) {
        record = { ...record, pinnedPosition: deltas.value.pins[item.id] };
      }

      result.push(record);
    }

    return result;
  }

  function loadDeltasFromStorage() {
    if (rememberMode.value) {
      const cached = localStorage.getItem(STORAGE_KEY_DELTAS);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            deltas.value = {
              pins: parsed.pins || {},
              edits: parsed.edits || {},
              deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
              createdRecords: Array.isArray(parsed.createdRecords) ? parsed.createdRecords : [],
              version: 1,
            };
          }
        } catch (e) {
          console.error('Failed to parse cached deltas', e);
        }
      }
    }
  }

  function saveDeltasToStorage() {
    if (rememberMode.value) {
      try {
        localStorage.setItem(STORAGE_KEY_DELTAS, JSON.stringify(deltas.value));
      } catch (e) {
        console.warn('LocalStorage quota limit reached for deltas', e);
      }
    }
  }

  function initData() {
    loadDeltasFromStorage();

    // Generate initial 500-item page
    const initialRaw = generateRecordsBatch(INITIAL_SEED_COUNT, 1);

    // Apply default sample pins if no cached deltas exist
    if (Object.keys(deltas.value.pins).length === 0 && deltas.value.createdRecords.length === 0) {
      if (initialRaw.length > 5) {
        deltas.value.pins[initialRaw[0].id] = 1;
        deltas.value.pins[initialRaw[2].id] = 3;
      }
    }

    const hydrated = applyDeltasToBatch(initialRaw);
    records.value = [...deltas.value.createdRecords, ...hydrated];
    totalLoadedCount.value = INITIAL_SEED_COUNT;
  }

  initData();

  // Watch delta modifications to persist lightweight JSON (<5 KB)
  watch(
    deltas,
    () => {
      saveDeltasToStorage();
    },
    { deep: true }
  );

  watch(rememberMode, (newVal) => {
    localStorage.setItem(STORAGE_KEY_REMEMBER, newVal ? 'true' : 'false');
    if (newVal) {
      saveDeltasToStorage();
      notify('info', 'Remember Mode Enabled', 'Delta modifications (pins, edits, creations) saved to lightweight storage (<5 KB).');
    } else {
      localStorage.removeItem(STORAGE_KEY_DELTAS);
      notify('info', 'Remember Mode Disabled', 'Delta storage cleared. Operating in fast in-memory mode.');
    }
  });

  // Sliding Memory Buffer: Appends next 500 rows and evicts distant batches if over MAX_RAM_CAP
  function loadNextBatch(batchSize = BATCH_SIZE) {
    if (isBatchLoading.value) return;

    isBatchLoading.value = true;
    setTimeout(() => {
      const nextBatchRaw = generateRecordsBatch(batchSize, totalLoadedCount.value + 1);
      const hydratedNext = applyDeltasToBatch(nextBatchRaw);

      let updatedList = [...records.value, ...hydratedNext];
      totalLoadedCount.value += batchSize;

      // Enforce client window RAM cap: drop oldest non-pinned unpinned rows if exceeding capacity
      if (updatedList.length > MAX_RAM_CAP) {
        const excess = updatedList.length - MAX_RAM_CAP;
        // Slice to maintain sliding window of active rows
        updatedList = updatedList.slice(excess);
      }

      records.value = updatedList;
      isBatchLoading.value = false;
    }, 120);
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

    deltas.value.createdRecords.unshift(newRecord);
    records.value.unshift(newRecord);

    notify('success', 'Record Created', `Successfully created record for ${newRecord.userName} (${newRecord.id})`);
    return newRecord;
  }

  function updateRecord(id: string, updates: Partial<Omit<DataRecord, 'id' | 'createdAt'>>): boolean {
    const idx = records.value.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const oldRecord = records.value[idx];
    const updated = {
      ...oldRecord,
      ...updates,
      updatedAt: Date.now(),
    };

    records.value[idx] = updated;

    // Track delta edit
    deltas.value.edits[id] = {
      ...(deltas.value.edits[id] || {}),
      ...updates,
      updatedAt: Date.now(),
    };

    notify('success', 'Record Updated', `Updated details for ${updated.userName} (${id})`);
    return true;
  }

  function deleteRecord(id: string): boolean {
    const idx = records.value.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const deletedUser = records.value[idx].userName;
    records.value.splice(idx, 1);

    // Track delta deletion
    if (!deltas.value.deletedIds.includes(id)) {
      deltas.value.deletedIds.push(id);
    }
    delete deltas.value.pins[id];
    delete deltas.value.edits[id];
    deltas.value.createdRecords = deltas.value.createdRecords.filter((r) => r.id !== id);

    notify('warning', 'Record Deleted', `Removed ${deletedUser} (${id}) from database.`);
    return true;
  }

  function pinRecord(id: string, targetPosition: number) {
    records.value = resolvePinCollision(records.value, id, targetPosition);

    // Update deltas pin map
    const pos = Math.max(1, Math.floor(targetPosition));
    const newPins: Record<string, number> = {};

    for (const [recId, curPos] of Object.entries(deltas.value.pins)) {
      if (recId === id) continue;
      if (curPos >= pos) {
        newPins[recId] = curPos + 1;
      } else {
        newPins[recId] = curPos;
      }
    }
    newPins[id] = pos;
    deltas.value.pins = newPins;

    const target = records.value.find((r) => r.id === id);
    notify('info', 'Row Pinned', `Pinned ${target?.userName || id} to slot #${targetPosition}. Overlapping pins shifted down.`);
  }

  function unpinRecord(id: string) {
    records.value = removePin(records.value, id);
    delete deltas.value.pins[id];
    notify('info', 'Row Unpinned', `Unpinned record #${id}. It now follows standard search/sort order.`);
  }

  function resetToDefaultSeed() {
    localStorage.removeItem(STORAGE_KEY_DELTAS);
    deltas.value = {
      pins: {},
      edits: {},
      deletedIds: [],
      createdRecords: [],
      version: 1,
    };

    totalLoadedCount.value = 0;
    const freshBatch = generateRecordsBatch(INITIAL_SEED_COUNT, 1);
    if (freshBatch.length > 5) {
      deltas.value.pins[freshBatch[0].id] = 1;
      deltas.value.pins[freshBatch[2].id] = 3;
    }

    const hydrated = applyDeltasToBatch(freshBatch);
    records.value = hydrated;
    totalLoadedCount.value = hydrated.length;

    notify('info', 'Database Reset', `Reset database to 500 clean records with empty delta storage.`);
  }

  const pinnedRecordsCount = computed(() => {
    return records.value.filter((r) => r.pinnedPosition !== null).length;
  });

  const memoryStats = computed<MemoryStats>(() => {
    const rawDeltaStr = JSON.stringify(deltas.value);
    return {
      activeRamCount: records.value.length,
      maxRamCap: MAX_RAM_CAP,
      totalDatasetTarget: TOTAL_DATASET_TARGET,
      deltaPayloadBytes: new Blob([rawDeltaStr]).size,
    };
  });

  return {
    records,
    deltas,
    rememberMode,
    isBatchLoading,
    totalLoadedCount,
    totalDatasetCount,
    pinnedRecordsCount,
    memoryStats,
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
