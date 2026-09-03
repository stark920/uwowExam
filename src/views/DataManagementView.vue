<template>
  <main class="max-w-[1720px] mx-auto px-3 sm:px-6 py-4 min-h-screen flex flex-col space-y-4 font-sans text-slate-100">
    <!-- Top Header -->
    <AppHeader
      :total-records="totalLoadedCount"
      :pinned-count="pinnedRecordsCount"
      :is-batch-loading="isBatchLoading"
      v-model:remember-mode="rememberMode"
      :show-metrics-h-u-d="showMetricsHUD"
      @toggle:metrics-h-u-d="showMetricsHUD = !showMetricsHUD"
      @reset:data="resetToDefaultSeed"
      @open:add-modal="openAddModal"
    />

    <!-- Part B Live Metrics HUD (Collapsible) -->
    <MetricsHUD
      v-if="showMetricsHUD"
      :metrics="metrics"
      @reset:metrics="resetMetrics"
    />

    <!-- Search & Filter Controls -->
    <SearchAndFilter
      :raw-query="rawQuery"
      :is-searching="isSearching"
      :filtered-count="displayList.length"
      :total-count="totalLoadedCount"
      :sort-criteria="sortCriteria"
      :view-mode="viewMode"
      @update:query="updateInput"
      @clear:query="clearSearch"
      @remove:sort="removeSort"
      @clear:sorts="clearAllSorts"
      @update:view-mode="viewMode = $event"
    />

    <!-- Desktop Data Table View -->
    <VirtualDataTable
      v-if="viewMode === 'table'"
      ref="tableRef"
      :items="displayList"
      :sort-criteria="sortCriteria"
      :search-query="debouncedQuery"
      :is-batch-loading="isBatchLoading"
      @sort="toggleSort"
      @pin="openPinModal"
      @unpin="unpinRecord"
      @edit="openEditModal"
      @delete="openDeleteConfirm"
      @reach:bottom="loadNextBatch"
      @clear:query="clearSearch"
    />

    <!-- Mobile Virtual Card List View -->
    <VirtualCardList
      v-else
      ref="cardListRef"
      :items="displayList"
      :search-query="debouncedQuery"
      :is-batch-loading="isBatchLoading"
      @pin="openPinModal"
      @unpin="unpinRecord"
      @edit="openEditModal"
      @delete="openDeleteConfirm"
      @reach:bottom="loadNextBatch"
      @clear:query="clearSearch"
    />

    <!-- Modal 1: Add Record Modal -->
    <RecordFormModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @submit:add="handleAddRecord"
    />

    <!-- Modal 2: Edit Record Modal -->
    <RecordFormModal
      :is-open="isEditModalOpen"
      :initial-data="editingRecord"
      @close="isEditModalOpen = false"
      @request:update-confirm="handleRequestUpdateConfirm"
    />

    <!-- Modal 3: Two-Step Update Confirmation Dialog -->
    <ConfirmDialog
      :is-open="isUpdateConfirmOpen"
      type="info"
      title="Confirm Changes"
      :message="`Are you sure you want to update the details for ${pendingUpdateData?.updates.userName || 'this record'} (${pendingUpdateData?.id})?`"
      confirm-text="Apply Changes"
      @confirm="applyPendingUpdate"
      @cancel="isUpdateConfirmOpen = false"
    />

    <!-- Modal 4: Delete Confirmation Dialog -->
    <ConfirmDialog
      :is-open="isDeleteConfirmOpen"
      type="danger"
      title="Delete Employee Record"
      :message="`Are you sure you want to delete ${deletingRecord?.userName} (${deletingRecord?.id})? This action cannot be undone.`"
      confirm-text="Delete Record"
      @confirm="confirmDeleteRecord"
      @cancel="isDeleteConfirmOpen = false"
    />

    <!-- Modal 5: Pin to Relative Slot Modal -->
    <PinModal
      :is-open="isPinModalOpen"
      :record="pinningRecord"
      @close="isPinModalOpen = false"
      @confirm:pin="handlePinConfirm"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { DataRecord } from '../types';
import { useDataStore } from '../composables/useDataStore';
import { useDebouncedSearch } from '../composables/useDebouncedSearch';
import { useMultiSort } from '../composables/useMultiSort';
import { computeDisplayList } from '../composables/usePinning';

// Components
import AppHeader from '../components/layout/AppHeader.vue';
import SearchAndFilter from '../components/layout/SearchAndFilter.vue';
import MetricsHUD from '../components/metrics/MetricsHUD.vue';
import VirtualDataTable from '../components/table/VirtualDataTable.vue';
import VirtualCardList from '../components/mobile/VirtualCardList.vue';
import RecordFormModal from '../components/modals/RecordFormModal.vue';
import ConfirmDialog from '../components/modals/ConfirmDialog.vue';
import PinModal from '../components/modals/PinModal.vue';

// Composables
const {
  records,
  rememberMode,
  isBatchLoading,
  totalLoadedCount,
  pinnedRecordsCount,
  loadNextBatch,
  addRecord,
  updateRecord,
  deleteRecord,
  pinRecord,
  unpinRecord,
  resetToDefaultSeed,
} = useDataStore();

const {
  rawQuery,
  debouncedQuery,
  isSearching,
  metrics,
  updateInput,
  clearSearch,
  resetMetrics,
} = useDebouncedSearch(300);

const {
  sortCriteria,
  toggleSort,
  removeSort,
  clearAllSorts,
} = useMultiSort();

// View Mode (Responsive: Desktop Table vs Mobile Cards)
const viewMode = ref<'table' | 'card'>('table');
const showMetricsHUD = ref<boolean>(true);

// Modals State
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const editingRecord = ref<DataRecord | null>(null);

const isUpdateConfirmOpen = ref(false);
const pendingUpdateData = ref<{ id: string; updates: Partial<DataRecord> } | null>(null);

const isDeleteConfirmOpen = ref(false);
const deletingRecord = ref<DataRecord | null>(null);

const isPinModalOpen = ref(false);
const pinningRecord = ref<DataRecord | null>(null);

// Reactive Display List
const displayList = computed(() => {
  return computeDisplayList(records.value, debouncedQuery.value, sortCriteria.value);
});

// Modal Handlers
function openAddModal() {
  isAddModalOpen.value = true;
}

function handleAddRecord(data: Omit<DataRecord, 'id' | 'createdAt' | 'updatedAt' | 'pinnedPosition'>) {
  addRecord(data);
}

function openEditModal(record: DataRecord) {
  editingRecord.value = { ...record };
  isEditModalOpen.value = true;
}

function handleRequestUpdateConfirm(id: string, updates: Partial<DataRecord>) {
  pendingUpdateData.value = { id, updates };
  isEditModalOpen.value = false;
  isUpdateConfirmOpen.value = true;
}

function applyPendingUpdate() {
  if (pendingUpdateData.value) {
    updateRecord(pendingUpdateData.value.id, pendingUpdateData.value.updates);
    isUpdateConfirmOpen.value = false;
    pendingUpdateData.value = null;
  }
}

function openDeleteConfirm(record: DataRecord) {
  deletingRecord.value = record;
  isDeleteConfirmOpen.value = true;
}

function confirmDeleteRecord() {
  if (deletingRecord.value) {
    deleteRecord(deletingRecord.value.id);
    isDeleteConfirmOpen.value = false;
    deletingRecord.value = null;
  }
}

function openPinModal(record: DataRecord) {
  pinningRecord.value = record;
  isPinModalOpen.value = true;
}

function handlePinConfirm(recordId: string, targetSlot: number) {
  pinRecord(recordId, targetSlot);
}

function checkViewport() {
  if (window.innerWidth <= 768 && viewMode.value === 'table') {
    viewMode.value = 'card';
  }
}

onMounted(() => {
  checkViewport();
  window.addEventListener('resize', checkViewport);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkViewport);
});
</script>
