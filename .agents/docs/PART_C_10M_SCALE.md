# Part C: Frontend Scale & Memory Architecture (10M Records Target)

## 1. Frontend Challenge & Scale Requirements

Rendering, searching, and scrolling through large datasets (up to **10,000,000 records target**) in a pure client-side SPA presents two major performance challenges:
1. **DOM Bloat & Reflow Overhead**: Mounting thousands of HTML elements triggers massive layout reflows, frame drops, and browser UI freezes (<10 FPS).
2. **Browser Memory (Heap) Expansion**: Keeping every generated or fetched record in reactive Vue arrays indefinitely causes unbounded RAM growth and eventual tab crashes.

---

## 2. Frontend-Only Scale Architecture

```
+-------------------------------------------------------------------------------+
|                       VUE 3 DATA MANAGEMENT APPLICATION                       |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | DOM Virtualization Layer (useVirtualScroll)                             |  |
|  | - Total Container Height = Total Matching Rows * Row Height (52px)       |  |
|  | - Only renders visible window slice (~35 DOM rows at any instant)       |  |
|  | - DOM node count remains constant (~250 elements) at 60 FPS             |  |
|  +-------------------------------------------------------------------------+  |
|                                     |                                         |
|  +-------------------------------------------------------------------------+  |
|  | Zero-Clone ID Array Pipeline (usePinning)                               |  |
|  | - Filters and multi-sorts lightweight string[] ID arrays                |  |
|  | - Resolves object references only for visible DOM slice (no clones)     |  |
|  | - Weaves matching pinned rows into 1-based relative display slots        |  |
|  +-------------------------------------------------------------------------+  |
|                                     |                                         |
|  +-------------------------------------------------------------------------+  |
|  | Client Memory Sliding Buffer (useDataStore)                             |  |
|  | - Initial load: 500 records                                            |  |
|  | - onReachBottom: appends +500 records on demand                         |  |
|  | - Bounded Capacity (MAX_RAM_CAP = 2500): evicts distant batches        |  |
|  +-------------------------------------------------------------------------+  |
|                                     |                                         |
|  +-------------------------------------------------------------------------+  |
|  | Delta-Only Storage Persistence ("Remember Mode")                        |  |
|  | - Saves only { pins, edits, deletedIds, createdRecords } (<5 KB)       |  |
|  | - Eliminates localStorage quota limits and full-dataset JSON writes     |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 3. Core Technical Pillars

### 3.1 Client-Side DOM Virtualization
* **Visible Window Slicing**: Calculates `startIndex` and `endIndex` from container `scrollTop` + overscan buffer (8 rows).
* **Virtual Spacer Padding**: Dynamically adjusts `topPadding` and `bottomPadding` CSS heights, giving users native scrollbar behavior without mounting invisible DOM nodes.
* **Fixed Memory & Render Footprint**: DOM node count remains locked at ~35 rows regardless of how many records are loaded.

### 3.2 Sliding Memory Buffer (RAM Capping)
* **Initial Memory Seed**: Starts with **500 records** on initial load.
* **Bounded Working Window**: Active working memory is capped at **2,500 records** (`MAX_RAM_CAP = 2500`).
* **Batch Eviction**: When new 500-batches are generated via bottom-reach scrolling, oldest unpinned batches outside the active viewport are evicted to keep heap memory strictly bounded.

### 3.3 Delta-Only Persistence ("Remember Mode")
* **The Problem**: Serializing entire table arrays to `localStorage` quickly hits the 5MB browser quota and causes major serialization lag.
* **The Fix**: Store only user modifications (`DeltaStoragePayload`):
  ```typescript
  interface DeltaStoragePayload {
    pins: Record<string, number>;              // recordId -> 1-based relative slot
    edits: Record<string, Partial<DataRecord>>; // recordId -> modified fields
    deletedIds: string[];                      // deleted record IDs
    createdRecords: DataRecord[];              // user-created records
    version: number;
  }
  ```
* **Footprint**: Delta payloads remain tiny (**< 5 KB**), enabling instant hydration and zero quota issues.

### 3.4 Zero-Clone ID Array Pipeline
* **Entity Store Map**: Holds records in an O(1) key-value lookup map.
* **ID-Based Operations**: Search filtering, sorting comparisons, and slot interleaving operate on lightweight ID arrays (`string[]`).
* **Zero GC Overhead**: Eliminates object spreading (`{ ...record }`) during rapid typing or sort toggling. Records are referenced directly from the map only when rendering the active DOM slice.
