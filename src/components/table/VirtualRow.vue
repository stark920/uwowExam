<template>
  <div
    class="table-row"
    :class="{ 'row-pinned': record.pinnedPosition !== null }"
  >
    <!-- Pin Slot Cell -->
    <div class="td-cell col-pin">
      <span v-if="record.pinnedPosition !== null" class="badge-pinned-slot" :title="`Pinned to Slot #${record.pinnedPosition}`">
        <Pin :size="11" />
        #{{ record.pinnedPosition }}
      </span>
      <span v-else class="unpinned-dash font-mono text-muted">-</span>
    </div>

    <!-- ID Cell -->
    <div class="td-cell col-id font-mono">
      <span class="id-tag">{{ record.id }}</span>
    </div>

    <!-- Name Cell -->
    <div class="td-cell col-name">
      <div class="name-wrapper">
        <div class="user-avatar">{{ getInitials(record.userName) }}</div>
        <span class="user-name" v-html="highlightMatch(record.userName, searchQuery)"></span>
      </div>
    </div>

    <!-- Position Cell -->
    <div class="td-cell col-position">
      <span class="position-tag" v-html="highlightMatch(record.position, searchQuery)"></span>
    </div>

    <!-- Location Cell -->
    <div class="td-cell col-location">
      <span class="location-text" v-html="highlightMatch(record.location, searchQuery)"></span>
    </div>

    <!-- Age Cell -->
    <div class="td-cell col-age font-mono text-right">
      <span class="age-badge">{{ record.age }}</span>
    </div>

    <!-- Date Start Cell -->
    <div class="td-cell col-date font-mono text-right">
      <span class="date-text">{{ record.dateStart }}</span>
    </div>

    <!-- Actions Cell -->
    <div class="td-cell col-actions">
      <div class="actions-group">
        <button
          v-if="record.pinnedPosition !== null"
          class="btn-action-icon btn-pinned"
          @click="$emit('unpin', record.id)"
          title="Unpin this row"
        >
          <PinOff :size="14" />
        </button>
        <button
          v-else
          class="btn-action-icon"
          @click="$emit('pin', record)"
          title="Pin to relative slot"
        >
          <Pin :size="14" />
        </button>

        <button
          class="btn-action-icon btn-edit"
          @click="$emit('edit', record)"
          title="Edit record details"
        >
          <Edit :size="14" />
        </button>

        <button
          class="btn-action-icon btn-delete"
          @click="$emit('delete', record)"
          title="Delete record"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, PinOff, Edit, Trash2 } from 'lucide-vue-next';
import type { DataRecord } from '../../types';

defineProps<{
  record: DataRecord;
  searchQuery: string;
}>();

defineEmits<{
  (e: 'pin', record: DataRecord): void;
  (e: 'unpin', id: string): void;
  (e: 'edit', record: DataRecord): void;
  (e: 'delete', record: DataRecord): void;
}>();

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="highlight-match">$1</mark>');
}
</script>

<style scoped>
.table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
  height: 52px;
  background: rgba(15, 23, 42, 0.4);
  transition: background 0.15s ease;
}

.table-row:hover {
  background: rgba(30, 41, 59, 0.7);
}

.row-pinned {
  background: rgba(245, 158, 11, 0.06);
  border-left: 3px solid #f59e0b;
}

.row-pinned:hover {
  background: rgba(245, 158, 11, 0.12);
}

.td-cell {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-pin { width: 70px; flex-shrink: 0; }
.col-id { width: 110px; flex-shrink: 0; }
.col-name { flex: 2; min-width: 170px; }
.col-position { flex: 2; min-width: 190px; }
.col-location { flex: 1.5; min-width: 150px; }
.col-age { width: 80px; flex-shrink: 0; justify-content: flex-end; }
.col-date { width: 130px; flex-shrink: 0; justify-content: flex-end; }
.col-actions { width: 120px; flex-shrink: 0; justify-content: center; }

.text-right { justify-content: flex-end; }

.badge-pinned-slot {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.4);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-full);
}

.unpinned-dash {
  font-size: 0.75rem;
  padding-left: 0.5rem;
}

.id-tag {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.name-wrapper {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
  border: 1px solid var(--border-active);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.position-tag {
  color: #cbd5e1;
  font-size: 0.82rem;
}

.location-text {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.age-badge {
  background: rgba(30, 41, 59, 0.8);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--text-primary);
}

.date-text {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-action-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action-icon:hover {
  background: rgba(51, 65, 85, 0.9);
  color: var(--text-primary);
  border-color: var(--border-active);
}

.btn-pinned {
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.15);
}
.btn-pinned:hover {
  background: rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.btn-edit:hover {
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.4);
}

.btn-delete:hover {
  color: var(--rose-text);
  border-color: rgba(244, 63, 94, 0.4);
  background: var(--rose-bg);
}

:deep(.highlight-match) {
  background: rgba(245, 158, 11, 0.35);
  color: #ffffff;
  padding: 0 0.15rem;
  border-radius: 2px;
  font-weight: 700;
}
</style>
