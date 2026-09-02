import type { DataRecord, SortCriteria } from '../types';

export function resolvePinCollision(
  records: DataRecord[],
  targetRecordId: string,
  targetPosition: number
): DataRecord[] {
  const pos = Math.max(1, Math.floor(targetPosition));

  return records.map((record) => {
    if (record.id === targetRecordId) {
      return { ...record, pinnedPosition: pos, updatedAt: Date.now() };
    }

    if (record.pinnedPosition !== null && record.pinnedPosition >= pos) {
      return { ...record, pinnedPosition: record.pinnedPosition + 1, updatedAt: Date.now() };
    }

    return record;
  });
}

export function removePin(records: DataRecord[], targetRecordId: string): DataRecord[] {
  return records.map((record) => {
    if (record.id === targetRecordId) {
      return { ...record, pinnedPosition: null, updatedAt: Date.now() };
    }
    return record;
  });
}

export function computeDisplayList(
  allRecords: DataRecord[],
  searchQuery: string,
  sortCriteria: SortCriteria[]
): DataRecord[] {
  const pinnedItems = allRecords
    .filter((r) => r.pinnedPosition !== null)
    .sort((a, b) => (a.pinnedPosition ?? 0) - (b.pinnedPosition ?? 0));

  let unpinnedItems = allRecords.filter((r) => r.pinnedPosition === null);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  if (trimmedQuery) {
    unpinnedItems = unpinnedItems.filter((r) => {
      return (
        r.userName.toLowerCase().includes(trimmedQuery) ||
        r.position.toLowerCase().includes(trimmedQuery) ||
        r.location.toLowerCase().includes(trimmedQuery) ||
        r.age.toString().includes(trimmedQuery) ||
        r.dateStart.includes(trimmedQuery) ||
        r.id.toLowerCase().includes(trimmedQuery)
      );
    });
  }

  if (sortCriteria.length > 0) {
    unpinnedItems.sort((a, b) => {
      for (const sort of sortCriteria) {
        const valA = a[sort.field];
        const valB = b[sort.field];
        if (valA === valB) continue;

        let comp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comp = valA - valB;
        } else {
          comp = String(valA).localeCompare(String(valB));
        }

        return sort.direction === 'asc' ? comp : -comp;
      }
      return 0;
    });
  }

  const result: DataRecord[] = [];
  let unpinnedIdx = 0;
  let currentSlot = 1;

  const pinnedMap = new Map<number, DataRecord>();
  pinnedItems.forEach((item) => {
    pinnedMap.set(item.pinnedPosition!, item);
  });

  const totalLength = pinnedItems.length + unpinnedItems.length;

  while (result.length < totalLength && (unpinnedIdx < unpinnedItems.length || pinnedMap.size > 0)) {
    if (pinnedMap.has(currentSlot)) {
      result.push(pinnedMap.get(currentSlot)!);
      pinnedMap.delete(currentSlot);
    } else if (unpinnedIdx < unpinnedItems.length) {
      result.push(unpinnedItems[unpinnedIdx++]);
    } else {
      const remainingPinned = Array.from(pinnedMap.values());
      result.push(...remainingPinned);
      pinnedMap.clear();
      break;
    }
    currentSlot++;
  }

  return result;
}
