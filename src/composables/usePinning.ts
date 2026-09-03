import type { DataRecord, SortCriteria } from '../types';

/**
 * Resolves pin collisions using Option A (Shift/Bump).
 * Overlapping pins at or below the target position shift down (+1).
 */
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

/**
 * Removes pin from target record.
 */
export function removePin(records: DataRecord[], targetRecordId: string): DataRecord[] {
  return records.map((record) => {
    if (record.id === targetRecordId) {
      return { ...record, pinnedPosition: null, updatedAt: Date.now() };
    }
    return record;
  });
}

/**
 * High-performance Zero-Clone Index Pipeline.
 * Filters and multi-sorts using lightweight ID arrays, then weaves matching
 * pinned items at their exact 1-based relative display slots.
 */
export function computeDisplayList(
  allRecords: DataRecord[],
  searchQuery: string,
  sortCriteria: SortCriteria[]
): DataRecord[] {
  const count = allRecords.length;
  if (count === 0) return [];

  // Fast entity lookup map
  const recordMap = new Map<string, DataRecord>();
  for (let i = 0; i < count; i++) {
    recordMap.set(allRecords[i].id, allRecords[i]);
  }

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // 1. Zero-clone filter: Collect matching record IDs
  const matchedIds: string[] = [];
  if (trimmedQuery) {
    for (let i = 0; i < count; i++) {
      const r = allRecords[i];
      if (
        r.userName.toLowerCase().includes(trimmedQuery) ||
        r.position.toLowerCase().includes(trimmedQuery) ||
        r.location.toLowerCase().includes(trimmedQuery) ||
        r.age.toString().includes(trimmedQuery) ||
        r.dateStart.includes(trimmedQuery) ||
        r.id.toLowerCase().includes(trimmedQuery)
      ) {
        matchedIds.push(r.id);
      }
    }
  } else {
    for (let i = 0; i < count; i++) {
      matchedIds.push(allRecords[i].id);
    }
  }

  // 2. Separate matching IDs into pinned vs unpinned
  const matchingPinnedIds: string[] = [];
  const matchingUnpinnedIds: string[] = [];

  for (let i = 0; i < matchedIds.length; i++) {
    const id = matchedIds[i];
    const rec = recordMap.get(id);
    if (rec && rec.pinnedPosition !== null) {
      matchingPinnedIds.push(id);
    } else {
      matchingUnpinnedIds.push(id);
    }
  }

  // Sort matching pinned by their pinned position
  matchingPinnedIds.sort((idA, idB) => {
    const posA = recordMap.get(idA)?.pinnedPosition ?? 0;
    const posB = recordMap.get(idB)?.pinnedPosition ?? 0;
    return posA - posB;
  });

  // 3. Multi-column sort unpinned IDs using recordMap references (no object cloning)
  if (sortCriteria.length > 0) {
    matchingUnpinnedIds.sort((idA, idB) => {
      const a = recordMap.get(idA)!;
      const b = recordMap.get(idB)!;

      for (let s = 0; s < sortCriteria.length; s++) {
        const sort = sortCriteria[s];
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

  // 4. Interleave matching pinned records at their 1-based relative display slots
  const finalIds: string[] = [];
  let unpinnedIdx = 0;
  let currentSlot = 1;

  const slotMap = new Map<number, string>();
  for (let i = 0; i < matchingPinnedIds.length; i++) {
    const id = matchingPinnedIds[i];
    const pos = recordMap.get(id)?.pinnedPosition;
    if (pos) slotMap.set(pos, id);
  }

  const totalLength = matchingPinnedIds.length + matchingUnpinnedIds.length;

  while (finalIds.length < totalLength && (unpinnedIdx < matchingUnpinnedIds.length || slotMap.size > 0)) {
    if (slotMap.has(currentSlot)) {
      finalIds.push(slotMap.get(currentSlot)!);
      slotMap.delete(currentSlot);
    } else if (unpinnedIdx < matchingUnpinnedIds.length) {
      finalIds.push(matchingUnpinnedIds[unpinnedIdx++]);
    } else {
      const remainingPinned = Array.from(slotMap.values());
      finalIds.push(...remainingPinned);
      slotMap.clear();
      break;
    }
    currentSlot++;
  }

  // 5. Materialize final record references (O(N) direct map lookups, zero clones)
  const result: DataRecord[] = new Array(finalIds.length);
  for (let i = 0; i < finalIds.length; i++) {
    result[i] = recordMap.get(finalIds[i])!;
  }

  return result;
}
