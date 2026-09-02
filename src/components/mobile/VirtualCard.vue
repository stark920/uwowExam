<template>
  <div
    class="mobile-card glass-card"
    :class="{ 'card-pinned': record.pinnedPosition !== null }"
  >
    <div class="card-header">
      <div class="user-info">
        <div class="user-avatar">{{ getInitials(record.userName) }}</div>
        <div>
          <div class="user-name" v-html="highlightMatch(record.userName, searchQuery)"></div>
          <div class="user-id font-mono">{{ record.id }}</div>
        </div>
      </div>

      <div class="card-badges">
        <span v-if="record.pinnedPosition !== null" class="badge badge-pinned">
          <Pin :size="11" />
          Slot #{{ record.pinnedPosition }}
        </span>
      </div>
    </div>

    <div class="card-body">
      <div class="detail-row">
        <span class="detail-label"><Briefcase :size="13" /> Position:</span>
        <span class="detail-val position-text" v-html="highlightMatch(record.position, searchQuery)"></span>
      </div>
      <div class="detail-row">
        <span class="detail-label"><MapPin :size="13" /> Location:</span>
        <span class="detail-val" v-html="highlightMatch(record.location, searchQuery)"></span>
      </div>
      <div class="detail-meta">
        <div class="meta-item">
          <span class="meta-label">Age:</span>
          <span class="meta-val font-mono">{{ record.age }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Start Date:</span>
          <span class="meta-val font-mono">{{ record.dateStart }}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="card-actions">
        <button
          v-if="record.pinnedPosition !== null"
          class="btn btn-secondary btn-card-action btn-pinned-mobile"
          @click="$emit('unpin', record.id)"
        >
          <PinOff :size="13" />
          <span>Unpin</span>
        </button>
        <button
          v-else
          class="btn btn-secondary btn-card-action"
          @click="$emit('pin', record)"
        >
          <Pin :size="13" />
          <span>Pin</span>
        </button>

        <button
          class="btn btn-secondary btn-card-action"
          @click="$emit('edit', record)"
        >
          <Edit :size="13" />
          <span>Edit</span>
        </button>

        <button
          class="btn btn-outline-danger btn-card-action"
          @click="$emit('delete', record)"
        >
          <Trash2 :size="13" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, PinOff, Edit, Trash2, Briefcase, MapPin } from 'lucide-vue-next';
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
.mobile-card {
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: rgba(15, 23, 42, 0.7);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 190px;
}

.card-pinned {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.user-id {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.82rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-muted);
  width: 85px;
  flex-shrink: 0;
}

.detail-val {
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.position-text {
  color: #cbd5e1;
  font-weight: 500;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.2rem;
  padding-top: 0.35rem;
  border-top: 1px dashed var(--border-subtle);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
}

.meta-label {
  color: var(--text-muted);
}

.meta-val {
  color: var(--text-primary);
  font-weight: 500;
}

.card-footer {
  margin-top: auto;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-card-action {
  flex: 1;
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
}

.btn-pinned-mobile {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.4);
}

:deep(.highlight-match) {
  background: rgba(245, 158, 11, 0.35);
  color: #ffffff;
  padding: 0 0.15rem;
  border-radius: 2px;
  font-weight: 700;
}
</style>
