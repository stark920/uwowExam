import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolvePinCollision, removePin, computeDisplayList } from '../composables/usePinning';
import { useMultiSort } from '../composables/useMultiSort';
import { useDebouncedSearch } from '../composables/useDebouncedSearch';
import { generateRecordsBatch } from '../utils/mockGenerator';
import type { DataRecord } from '../types';

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

  it('computes display list locking pinned items to target slots regardless of search filter (Behavior B)', () => {
    const display = computeDisplayList(records, 'PM', []);
    expect(display.length).toBe(3);
    expect(display[0].id).toBe('1');
    expect(display[1].id).toBe('2');
    expect(display[2].id).toBe('3');
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
