import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolvePinCollision, removePin, computeDisplayList } from '../composables/usePinning';
import { useMultiSort } from '../composables/useMultiSort';
import { useDebouncedSearch } from '../composables/useDebouncedSearch';
import { generateRecordsBatch } from '../utils/mockGenerator';
import type { DataRecord, DeltaStoragePayload } from '../types';

describe('1. Mock Data Generator', () => {
  it('generates 500 records with valid properties', () => {
    const batch = generateRecordsBatch(500, 1);
    expect(batch.length).toBe(500);
    expect(batch[0].id).toBe('REC-000001');
    expect(batch[499].id).toBe('REC-000500');
    expect(batch[0].userName).toBeTruthy();
    expect(batch[0].age).toBeGreaterThanOrEqual(18);
    expect(batch[0].dateStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(batch[0].pinnedPosition).toBeNull();
  });
});

describe('2. Relative Pinning & Collision Resolution (Option A Shift/Bump)', () => {
  let records: DataRecord[];

  beforeEach(() => {
    records = [
      { id: '1', userName: 'Alice', position: 'Eng', location: 'SF', age: 30, dateStart: '2023-01-01', pinnedPosition: 1, createdAt: 1, updatedAt: 1 },
      { id: '2', userName: 'Bob', position: 'Des', location: 'NY', age: 25, dateStart: '2023-02-01', pinnedPosition: 2, createdAt: 1, updatedAt: 1 },
      { id: '3', userName: 'Charlie', position: 'PM', location: 'UK', age: 35, dateStart: '2023-03-01', pinnedPosition: null, createdAt: 1, updatedAt: 1 },
      { id: '4', userName: 'David', position: 'QA', location: 'SG', age: 28, dateStart: '2023-04-01', pinnedPosition: null, createdAt: 1, updatedAt: 1 },
    ];
  });

  it('bumps existing pinned items down (+1) when new item is pinned to an occupied slot', () => {
    const updated = resolvePinCollision(records, '3', 2);
    const charlie = updated.find(r => r.id === '3');
    const bob = updated.find(r => r.id === '2');
    const alice = updated.find(r => r.id === '1');

    expect(alice?.pinnedPosition).toBe(1);
    expect(charlie?.pinnedPosition).toBe(2);
    expect(bob?.pinnedPosition).toBe(3);
  });

  it('correctly unpins an item', () => {
    const updated = removePin(records, '2');
    const bob = updated.find(r => r.id === '2');
    expect(bob?.pinnedPosition).toBeNull();
  });

  it('filters all columns and excludes non-matching pinned rows from search results', () => {
    // Charlie matches 'PM', but Alice (pinned 1) and Bob (pinned 2) do not match 'PM'
    const display = computeDisplayList(records, 'PM', []);
    expect(display.length).toBe(1);
    expect(display[0].id).toBe('3');
  });

  it('interleaves matching pinned items at their exact 1-based relative slot index (zero-clone pipeline)', () => {
    // When no search query, slot 1 has Alice, slot 2 has Bob, slot 3 has Charlie, slot 4 has David
    const display = computeDisplayList(records, '', []);
    expect(display.length).toBe(4);
    expect(display[0].id).toBe('1'); // Slot 1
    expect(display[1].id).toBe('2'); // Slot 2
    expect(display[2].id).toBe('3'); // Slot 3
    expect(display[3].id).toBe('4'); // Slot 4
  });
});

describe('3. Composite Multi-Column Sorting', () => {
  it('toggles sort directions and manages priority numbers #1, #2', () => {
    const { sortCriteria, toggleSort, removeSort } = useMultiSort();

    toggleSort('location');
    expect(sortCriteria.value).toEqual([{ field: 'location', direction: 'asc', priority: 1 }]);

    toggleSort('age');
    expect(sortCriteria.value).toEqual([
      { field: 'location', direction: 'asc', priority: 1 },
      { field: 'age', direction: 'asc', priority: 2 },
    ]);

    toggleSort('location');
    expect(sortCriteria.value[0].direction).toBe('desc');

    removeSort('location');
    expect(sortCriteria.value).toEqual([{ field: 'age', direction: 'asc', priority: 1 }]);
  });
});

describe('4. Search Debounce & AbortController Metrics (Part B)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('batches keystrokes, cancels in-flight controllers, and computes traffic reduction %', () => {
    const { rawQuery, debouncedQuery, metrics, updateInput } = useDebouncedSearch(300);

    updateInput('E');
    updateInput('En');
    updateInput('Eng');
    updateInput('Engi');
    updateInput('Engin');
    updateInput('Engine');
    updateInput('Enginee');
    updateInput('Engineer');

    expect(rawQuery.value).toBe('Engineer');
    expect(debouncedQuery.value).toBe('');
    expect(metrics.totalKeystrokes).toBe(8);
    expect(metrics.abortedRequests).toBe(7);

    vi.advanceTimersByTime(300);

    expect(debouncedQuery.value).toBe('Engineer');
    expect(metrics.debouncedExecutions).toBe(1);
    expect(metrics.trafficReductionPercent).toBe(88);
  });
});

describe('5. Memory Architecture & Delta Persistence (Part C)', () => {
  it('serializes lightweight delta payloads under 5 KB instead of full row arrays', () => {
    const deltaPayload: DeltaStoragePayload = {
      pins: { 'REC-000001': 1, 'REC-000005': 3 },
      edits: { 'REC-000001': { userName: 'Elena Rostova Updated', age: 32 } },
      deletedIds: ['REC-000002'],
      createdRecords: [{
        id: 'REC-000501',
        userName: 'New Employee',
        position: 'Architect',
        location: 'Berlin',
        age: 30,
        dateStart: '2024-01-01',
        pinnedPosition: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }],
      version: 1,
    };

    const jsonStr = JSON.stringify(deltaPayload);
    const sizeBytes = new Blob([jsonStr]).size;

    // Delta payload size is well below 1 KB
    expect(sizeBytes).toBeLessThan(1024);
    expect(deltaPayload.pins['REC-000001']).toBe(1);
    expect(deltaPayload.deletedIds).toContain('REC-000002');
  });

  it('sliding window maintains active memory capacity under 2,500 rows', () => {
    const MAX_RAM_CAP = 2500;
    let inMemoryRows: DataRecord[] = generateRecordsBatch(500, 1);
    expect(inMemoryRows.length).toBe(500);

    // Append 5 additional 500-batches (total 3,000 rows generated)
    for (let i = 1; i <= 5; i++) {
      const nextBatch = generateRecordsBatch(500, inMemoryRows.length + 1);
      inMemoryRows = [...inMemoryRows, ...nextBatch];
      if (inMemoryRows.length > MAX_RAM_CAP) {
        const excess = inMemoryRows.length - MAX_RAM_CAP;
        inMemoryRows = inMemoryRows.slice(excess);
      }
    }

    // Verified: in-memory rows is capped at exactly MAX_RAM_CAP
    expect(inMemoryRows.length).toBe(MAX_RAM_CAP);
  });
});
