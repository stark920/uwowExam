# Part A: System Architecture & Component Specification

## 1. Overview
Part A defines the architecture, data models, business logic algorithms, and component design for the **Vue 3 + TypeScript Data Management System**.

---

## 2. Data Model & Types

```typescript
export interface DataRecord {
  id: string;                    // Unique Identifier (e.g., "REC-00001")
  userName: string;              // Full Name (e.g., "Alexander Wright")
  position: string;              // Job Title (e.g., "Senior Software Engineer")
  location: string;              // City / Country (e.g., "San Francisco, US")
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

export interface FilterOptions {
  searchQuery: string;
  sortCriteria: SortCriteria[];
  rememberMode: boolean;
}
```

---

## 3. Component Hierarchy

```
App.vue
├── AppHeader.vue
│   ├── AppLogo & Title
│   ├── RememberModeToggle (Checkbox / Switch for localStorage persistence)
│   ├── MetricsHUDToggle (Toggle Search Inspector HUD)
│   └── GlobalActions (Add Record, Reset / Seed Data)
│
├── SearchAndFilterBar.vue
│   ├── SearchInput (300ms Debounce + AbortController)
│   ├── ActiveSortChips (Displays #1, #2 sort priorities with remove buttons)
│   ├── MobileViewToggle (Card View vs. Table View switch for 375x667px)
│   └── RecordCountBadge (Total in memory / Filtered count)
│
├── MetricsHUD.vue (Part B Live Inspector)
│
├── VirtualDataTable.vue (Desktop 1920x1080 View & Mobile Table View)
│   ├── TableHeader (Sortable column headers with priority badges)
│   ├── VirtualScrollContainer (DOM Virtualizer, rendering ~35 rows)
│   │   └── VirtualRow.vue
│   │       ├── PinnedBadge (with quick unpin / re-pin popover)
│   │       ├── HighlightedDataCells (Highlights search matches)
│   │       └── RowActions (Pin, Edit, Delete)
│   └── InfiniteLoadingTrigger (Auto-fetches next 500 rows when approaching bottom)
│
├── VirtualCardList.vue (Mobile 375x667 Card View Mode)
│   └── VirtualCard.vue (Touch-friendly cards with action sheets)
│
└── Modals & Dialogs
    ├── RecordFormModal.vue (Add / Edit form with schema validation)
    ├── ConfirmDialog.vue (Generic confirmation modal for Update & Delete)
    └── PinPositionModal.vue (Prompt for target 1-based relative slot)
```

---

## 4. Relative Pinning Engine

### 4.1 Collision Resolution: Shift / Bump
* When a record is pinned to an already occupied `targetPosition`:
  1. Find all existing pinned records where `pinnedPosition >= targetPosition`.
  2. Shift each such record down by `+1` (`pinnedPosition = pinnedPosition + 1`).
  3. Assign the target record `pinnedPosition = targetPosition`.

### 4.2 Search Filtering Interaction: Pin Absolute / Always Visible
* Pinned rows **always remain locked** to their assigned relative slots.
* Search query matches populate the unpinned slots around pinned items.
* If total matching items + pinned items < assigned slot, the pinned item is clamped to the end of the visible list.

### 4.3 Display List Computation Algorithm
```typescript
export function computeDisplayList(
  allRecords: DataRecord[],
  searchQuery: string,
  sortCriteria: SortCriteria[]
): DataRecord[] {
  // 1. Separate pinned vs unpinned items
  const pinnedItems = allRecords
    .filter(r => r.pinnedPosition !== null)
    .sort((a, b) => (a.pinnedPosition ?? 0) - (b.pinnedPosition ?? 0));

  // 2. Filter unpinned items by search query
  let unpinnedItems = allRecords.filter(r => r.pinnedPosition === null);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    unpinnedItems = unpinnedItems.filter(r =>
      r.userName.toLowerCase().includes(q) ||
      r.position.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.age.toString().includes(q) ||
      r.dateStart.includes(q)
    );
  }

  // 3. Apply composite multi-column sorting
  if (sortCriteria.length > 0) {
    unpinnedItems.sort((a, b) => {
      for (const sort of sortCriteria) {
        const valA = a[sort.field];
        const valB = b[sort.field];
        if (valA === valB) continue;
        const comp = valA > valB ? 1 : -1;
        return sort.direction === 'asc' ? comp : -comp;
      }
      return 0;
    });
  }

  // 4. Assemble final display list with pinned items locked in relative slots
  const result: DataRecord[] = [];
  let unpinnedIdx = 0;
  let targetDisplayPos = 1;

  const pinnedMap = new Map<number, DataRecord>();
  pinnedItems.forEach(item => pinnedMap.set(item.pinnedPosition!, item));

  const totalLength = pinnedItems.length + unpinnedItems.length;

  while (result.length < totalLength && (unpinnedIdx < unpinnedItems.length || pinnedMap.size > 0)) {
    if (pinnedMap.has(targetDisplayPos)) {
      result.push(pinnedMap.get(targetDisplayPos)!);
      pinnedMap.delete(targetDisplayPos);
    } else if (unpinnedIdx < unpinnedItems.length) {
      result.push(unpinnedItems[unpinnedIdx++]);
    } else {
      const remainingPinned = Array.from(pinnedMap.values());
      result.push(...remainingPinned);
      pinnedMap.clear();
      break;
    }
    targetDisplayPos++;
  }

  return result;
}
```

---

## 5. CRUD Workflows & Confirmation Modals

| Operation | User Flow & Validations | Confirmation Step |
| :--- | :--- | :--- |
| **Add Data** | Opens empty form modal.<br>• `userName`: Required, min 2 chars<br>• `position`: Required<br>• `location`: Required<br>• `age`: Integer between 18 and 100<br>• `dateStart`: Valid `YYYY-MM-DD` | Commits on valid submit with success toast notification. |
| **Update Data** | Opens pre-filled form modal with original record data. | Clicking "Save Changes" prompts an **explicit confirmation dialog** (`"Are you sure you want to update record #REC-XXXX?"`) before committing. |
| **Delete Data** | User clicks Delete icon on a row/card. | Opens **destructive confirmation modal** (`"Are you sure you want to delete this record? This action cannot be undone."`). |
| **Pin / Unpin** | Clicking Pin icon opens modal to choose target 1-based index or 1-click unpin. | Instantly calculates collision shifts and updates display order. |

---

## 6. Responsive Viewport Specifications

### 6.1 Desktop Viewport (`1920 x 1080 px`)
* Full-width glassmorphic header with statistics and quick action buttons.
* Multi-column sortable table with optimized column widths:
  * `Pin Slot` (60px) | `ID` (100px) | `User Name` (220px) | `Position` (240px) | `Location` (180px) | `Age` (80px) | `Date Start` (130px) | `Actions` (120px).
* Hover states with glowing outlines, keyboard shortcuts, and immediate action buttons.

### 6.2 Mobile Viewport (`375 x 667 px`)
* **Responsive Hybrid Mode Toggle**:
  * **Card View (Default)**: High-contrast touch cards with avatar initials, pinned badges, job tags, and bottom-sheet actions.
  * **Compact Table View**: Virtualized table with horizontal scroll and fixed action column.
* Touch-optimized tap targets (minimum 44px) and full-screen bottom-sheet modals.
