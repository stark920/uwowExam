# Part A: System Architecture & Component Specification

## 1. Overview
Part A defines the architecture, data models, business logic algorithms, and component design for the **Vue 3 + Nuxt UI + TypeScript Data Management System**.

---

## 2. Data Model & Types

```typescript
export interface DataRecord {
  id: string;                    // Unique Identifier (e.g., "REC-000001")
  userName: string;              // Full Name (e.g., "Elena Rostova")
  position: string;              // Job Title (e.g., "Senior Frontend Architect")
  location: string;              // City / Country (e.g., "Singapore, SG")
  age: number;                   // Integer Age (18 - 100)
  dateStart: string;             // Date format YYYY-MM-DD (e.g., "2023-04-15")
  pinnedPosition: number | null; // 1-based relative display index (e.g. 1, 3, null)
  createdAt: number;             // Epoch timestamp
  updatedAt: number;
}

export interface SortCriteria {
  field: keyof Omit<DataRecord, 'pinnedPosition'>;
  direction: 'asc' | 'desc';
  priority: number; // 1 = Primary, 2 = Secondary, etc.
}

export interface DeltaStoragePayload {
  pins: Record<string, number>;
  edits: Record<string, Partial<DataRecord>>;
  deletedIds: string[];
  createdRecords: DataRecord[];
  version: number;
}
```

---

## 3. Component Hierarchy

```
App.vue (wrapped in <UApp>)
└── DataManagementView.vue
    ├── AppHeader.vue
    │   ├── Logo & Title
    │   ├── DatasetStatsBadge (Loaded count vs 10,000,000 target)
    │   ├── PinnedBadge & LoadingIndicator
    │   ├── RememberModeSwitch (USwitch for delta persistence)
    │   └── ActionButtons (Reset Seed, Add Record via UButton)
    │
    ├── MetricsHUD.vue (Part B & C Live Performance & Memory Inspector)
    │
    ├── SearchAndFilter.vue
    │   ├── SearchInput (UInput with 300ms Debounce + AbortController)
    │   ├── ActiveSortChips (UBadge with #1, #2 priorities & remove triggers)
    │   ├── ViewModeToggle (Table View vs Card View switch)
    │   └── FilteredCountBadge
    │
    ├── VirtualDataTable.vue (Desktop Table View with Sticky Chrome)
    │   ├── TableHeader.vue (Sortable column headers with priority badges)
    │   ├── VirtualScrollContainer (DOM Virtualizer, rendering ~35 rows)
    │   │   └── VirtualRow.vue (Row with UButton actions & UBadge relative pin slot)
    │   └── BatchLoaderFooter (+500 onReachBottom loader)
    │
    ├── VirtualCardList.vue (Mobile Card View)
    │   └── VirtualCard.vue (Touch-friendly cards with action buttons)
    │
    └── Modals & Dialogs (Nuxt UI UModal + UCard)
        ├── RecordFormModal.vue (Add / Edit form with type validation)
        ├── ConfirmDialog.vue (Two-step confirmation for Update & Delete)
        └── PinModal.vue (1-based relative slot selector with shift info)
```

---

## 4. Relative Pinning Engine

### 4.1 Collision Resolution: Shift / Bump
* When a record is pinned to an already occupied `targetPosition`:
  1. Find all existing pinned records where `pinnedPosition >= targetPosition`.
  2. Shift each such record down by `+1` (`pinnedPosition = pinnedPosition + 1`).
  3. Assign the target record `pinnedPosition = targetPosition`.

### 4.2 Search Filtering Interaction
* The search query filters **all columns across all records** (both pinned and unpinned) first.
* A pinned record that does not match the search query is filtered out.
* Matching pinned records are then woven into the result list at their respective 1-based relative display slots.

### 4.3 Zero-Clone Display List Computation Algorithm
```typescript
export function computeDisplayList(
  allRecords: DataRecord[],
  searchQuery: string,
  sortCriteria: SortCriteria[]
): DataRecord[] {
  const count = allRecords.length;
  if (count === 0) return [];

  const recordMap = new Map<string, DataRecord>();
  for (let i = 0; i < count; i++) {
    recordMap.set(allRecords[i].id, allRecords[i]);
  }

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // 1. Zero-clone filter on IDs
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

  matchingPinnedIds.sort((idA, idB) => {
    const posA = recordMap.get(idA)?.pinnedPosition ?? 0;
    const posB = recordMap.get(idB)?.pinnedPosition ?? 0;
    return posA - posB;
  });

  // 3. Multi-column sort unpinned IDs (no object cloning)
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

  // 5. Materialize final record references
  const result: DataRecord[] = new Array(finalIds.length);
  for (let i = 0; i < finalIds.length; i++) {
    result[i] = recordMap.get(finalIds[i])!;
  }

  return result;
}
```

---

## 5. CRUD Workflows & Nuxt UI Modals

| Operation | User Flow & Validations | Confirmation Step |
| :--- | :--- | :--- |
| **Add Data** | Opens empty `UModal` with `UInput` fields.<br>• `userName`: Required, min 2 chars<br>• `position`: Required<br>• `location`: Required<br>• `age`: Integer between 18 and 100<br>• `dateStart`: Valid `YYYY-MM-DD` | Commits on valid submit with success toast notification via `useToast()`. |
| **Update Data** | Opens pre-filled `UModal` with original record data. | Clicking "Save Changes" prompts a **2-step update confirmation dialog** via `ConfirmDialog.vue` before committing. |
| **Delete Data** | User clicks Delete button on row/card. | Opens **destructive confirmation modal** via `ConfirmDialog.vue`. |
| **Pin / Unpin** | Clicking Pin button opens `PinModal.vue` to select target 1-based relative slot or unpin. | Calculates collision shifts and updates slot position instantly. |

---

## 6. Responsive Viewport Specifications

### 6.1 Desktop Viewport (`1920 x 1080 px`)
* Nuxt UI glassmorphic header with dataset statistics (`500 / 10,000,000 Loaded`) and action buttons.
* Multi-column sortable table with sticky chrome header and 60 FPS DOM virtualization.

### 6.2 Mobile Viewport (`375 x 667 px`)
* **Responsive Card View**: Touch-friendly cards with avatar initials, relative slot badges, job tags, and action buttons.
* Touch-optimized tap targets and modal overlays.
