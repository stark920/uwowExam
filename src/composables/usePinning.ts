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
  const trimmedQuery = searchQuery.trim().toLowerCase();

  // 1. Filter ALL records (both pinned & unpinned) by search query
  let filtered = allRecords;
  if (trimmedQuery) {
    filtered = allRecords.filter((r) => {
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

  // 2. Separate matching records into pinned vs unpinned
  const matchingPinned = filtered
    .filter((r) => r.pinnedPosition !== null)
    .sort((a, b) => (a.pinnedPosition ?? 0) - (b.pinnedPosition ?? 0));

  let matchingUnpinned = filtered.filter((r) => r.pinnedPosition === null);

  // 3. Apply composite multi-column sorting to matching unpinned records
  if (sortCriteria.length > 0) {
    matchingUnpinned.sort((a, b) => {
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

  // 4. Interleave matching pinned records into the list at their 1-based relative slot
  const result: DataRecord[] = [];
  let unpinnedIdx = 0;
  let currentSlot = 1;

  const pinnedMap = new Map<number, DataRecord>();
  matchingPinned.forEach((item) => {
    pinnedMap.set(item.pinnedPosition!, item);
  });

  const totalLength = matchingPinned.length + matchingUnpinned.length;

  while (result.length < totalLength && (unpinnedIdx < matchingUnpinned.length || pinnedMap.size > 0)) {
    if (pinnedMap.has(currentSlot)) {
      result.push(pinnedMap.get(currentSlot)!);
      pinnedMap.delete(currentSlot);
    } else if (unpinnedIdx < matchingUnpinned.length) {
      result.push(matchingUnpinned[unpinnedIdx++]);
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
