<template>
  <div class="table-header-row">
    <div class="th-cell col-pin" title="Relative Pin Slot Index">
      <Pin :size="13" />
      <span>Slot</span>
    </div>

    <div class="th-cell col-id" @click="$emit('sort', 'id')">
      <span>ID</span>
      <div class="sort-indicators">
        <span v-if="getSortInfo('id').priority" class="sort-priority">#{{ getSortInfo('id').priority }}</span>
        <ArrowUp v-if="getSortInfo('id').direction === 'asc'" :size="12" class="sort-arrow" />
        <ArrowDown v-else-if="getSortInfo('id').direction === 'desc'" :size="12" class="sort-arrow" />
        <ArrowUpDown v-else :size="11" class="sort-placeholder" />
      </div>
    </div>

    <div class="th-cell col-name" @click="$emit('sort', 'userName')">
      <span>User Name</span>
      <div class="sort-indicators">
        <span v-if="getSortInfo('userName').priority" class="sort-priority">#{{ getSortInfo('userName').priority }}</span>
        <ArrowUp v-if="getSortInfo('userName').direction === 'asc'" :size="12" class="sort-arrow" />
        <ArrowDown v-else-if="getSortInfo('userName').direction === 'desc'" :size="12" class="sort-arrow" />
        <ArrowUpDown v-else :size="11" class="sort-placeholder" />
      </div>
    </div>

    <div class="th-cell col-position" @click="$emit('sort', 'position')">
      <span>Position</span>
      <div class="sort-indicators">
        <span v-if="getSortInfo('position').priority" class="sort-priority">#{{ getSortInfo('position').priority }}</span>
        <ArrowUp v-if="getSortInfo('position').direction === 'asc'" :size="12" class="sort-arrow" />
        <ArrowDown v-else-if="getSortInfo('position').direction === 'desc'" :size="12" class="sort-arrow" />
        <ArrowUpDown v-else :size="11" class="sort-placeholder" />
      </div>
    </div>

    <div class="th-cell col-location" @click="$emit('sort', 'location')">
      <span>Location</span>
      <div class="sort-indicators">
        <span v-if="getSortInfo('location').priority" class="sort-priority">#{{ getSortInfo('location').priority }}</span>
        <ArrowUp v-if="getSortInfo('location').direction === 'asc'" :size="12" class="sort-arrow" />
        <ArrowDown v-else-if="getSortInfo('location').direction === 'desc'" :size="12" class="sort-arrow" />
        <ArrowUpDown v-else :size="11" class="sort-placeholder" />
      </div>
    </div>

    <div class="th-cell col-age" @click="$emit('sort', 'age')">
      <span>Age</span>
      <div class="sort-indicators">
        <span v-if="getSortInfo('age').priority" class="sort-priority">#{{ getSortInfo('age').priority }}</span>
        <ArrowUp v-if="getSortInfo('age').direction === 'asc'" :size="12" class="sort-arrow" />
        <ArrowDown v-else-if="getSortInfo('age').direction === 'desc'" :size="12" class="sort-arrow" />
        <ArrowUpDown v-else :size="11" class="sort-placeholder" />
      </div>
    </div>

    <div class="th-cell col-date" @click="$emit('sort', 'dateStart')">
      <span>Date Start</span>
      <div class="sort-indicators">
        <span v-if="getSortInfo('dateStart').priority" class="sort-priority">#{{ getSortInfo('dateStart').priority }}</span>
        <ArrowUp v-if="getSortInfo('dateStart').direction === 'asc'" :size="12" class="sort-arrow" />
        <ArrowDown v-else-if="getSortInfo('dateStart').direction === 'desc'" :size="12" class="sort-arrow" />
        <ArrowUpDown v-else :size="11" class="sort-placeholder" />
      </div>
    </div>

    <div class="th-cell col-actions">
      <span>Actions</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-vue-next';
import type { SortCriteria, SortField } from '../../types';

const props = defineProps<{
  sortCriteria: SortCriteria[];
}>();

defineEmits<{
  (e: 'sort', field: SortField): void;
}>();

function getSortInfo(field: SortField) {
  const existing = props.sortCriteria.find((s) => s.field === field);
  return {
    direction: existing ? existing.direction : null,
    priority: existing ? existing.priority : null,
  };
}
</script>

<style scoped>
.table-header-row {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 2px solid var(--border-subtle);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
}

.th-cell {
  padding: 0.85rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease, background 0.15s ease;
}

.th-cell:hover:not(.col-pin):not(.col-actions) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.col-pin { width: 70px; flex-shrink: 0; cursor: default; }
.col-id { width: 110px; flex-shrink: 0; }
.col-name { flex: 2; min-width: 170px; }
.col-position { flex: 2; min-width: 190px; }
.col-location { flex: 1.5; min-width: 150px; }
.col-age { width: 80px; flex-shrink: 0; justify-content: flex-end; }
.col-date { width: 130px; flex-shrink: 0; justify-content: flex-end; }
.col-actions { width: 120px; flex-shrink: 0; justify-content: center; cursor: default; }

.sort-indicators {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-left: 0.2rem;
}

.sort-priority {
  background: var(--accent-primary);
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0 0.25rem;
  border-radius: 999px;
  line-height: 1.2;
}

.sort-arrow {
  color: var(--indigo-text);
}

.sort-placeholder {
  color: var(--text-muted);
  opacity: 0.3;
}

.th-cell:hover .sort-placeholder {
  opacity: 0.8;
}
</style>
