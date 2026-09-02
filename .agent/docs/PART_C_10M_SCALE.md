# Part C: Infinite Scroll Architecture for 10 Million Rows

## 1. Challenge & Scale Requirements

Rendering and scrolling through **10,000,000 records** poses severe engineering challenges across both backend database querying and frontend browser memory/DOM performance:
* **Database Threat**: Deep `OFFSET` queries (`OFFSET 5,000,000 LIMIT 500`) take seconds to traverse millions of rows, causing high DB CPU load and timeouts.
* **Browser Threat**: Mounting hundreds of thousands of HTML elements creates massive memory leaks, garbage collection freezes, and reduces scrolling FPS from 60 to <5 FPS.

---

## 2. End-to-End Architectural Solution

```
+-------------------------------------------------------------------------------+
|                             CLIENT APPLICATION                                |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | DOM Virtualization Layer (TanStack Virtual / Custom Virtualizer)        |  |
|  | - Total Virtual Height = Total Items * Row Height (e.g. 10M * 48px)     |  |
|  | - Only renders visible window (~35 DOM rows at any instant)             |  |
|  | - Total active DOM node count remains constant (~250 elements)         |  |
|  +-------------------------------------------------------------------------+  |
|                                     |                                         |
|  +-------------------------------------------------------------------------+  |
|  | Client Memory Sliding Window (5,000 - 10,000 Records Buffer)            |  |
|  | - Holds active batches in local memory for instant pin / sort           |  |
|  | - Evicts distant non-visible memory chunks to prevent heap bloat        |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
                                      |
                      Cursor-Based HTTP Request (LIMIT 500)
                        GET /api/records?cursor=DATE_ID
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                              SERVER / DATABASE                                |
|                                                                               |
|  SELECT id, user_name, position, location, age, date_start                   |
|  FROM records                                                                 |
|  WHERE (date_start, id) > (:last_date_start, :last_id)                        |
|  ORDER BY date_start ASC, id ASC                                              |
|  LIMIT 500;                                                                   |
|                                                                               |
|  - Index: CREATE INDEX idx_records_cursor ON records(date_start, id);         |
|  - Execution Time: O(log N) B-Tree Seek (<10ms constant lookup)               |
+-------------------------------------------------------------------------------+
```

---

## 3. Technical Pillar 1: Server-Side Cursor-Based Pagination

### 3.1 The Pitfall of `OFFSET / LIMIT`
When executing:
```sql
SELECT * FROM records ORDER BY date_start ASC, id ASC LIMIT 500 OFFSET 5000000;
```
The database engine must scan and discard 5,000,000 index tuples from disk memory before reading the desired 500 rows. Query response times degrade exponentially from **5ms** (page 1) to **8,500ms+** (page 10,000).

### 3.2 The Cursor Pagination Fix (Keyset Pagination)
Instead of counting rows, the client provides the sort key and ID of the last item received:
```sql
SELECT id, user_name, position, location, age, date_start
FROM records
WHERE (date_start, id) > (:last_date_start, :last_id)
ORDER BY date_start ASC, id ASC
LIMIT 500;
```

#### Why Cursor Pagination Scales to 10M+ Rows:
1. **Direct B-Tree Index Seek**: The database jumps directly to the matching index key node in `O(log N)` time.
2. **Consistent Sub-10ms Latency**: Query execution time at row 9,999,500 is identical to row 0 (<10ms).
3. **Resilient to Concurrent Inserts/Deletes**: Avoids duplicate rows or skipped rows caused by new records being inserted during scrolling.

---

## 4. Technical Pillar 2: Client-Side DOM Virtualization

### 4.1 How DOM Virtualization Works
1. **Virtual Container Height Calculation**:
   * Total virtual height is computed: `totalHeight = totalRowCount * itemHeight` (e.g. `10,000,000 * 48px = 480,000,000px`).
   * For browsers with max CSS pixel height limits (~33,554,400px), a virtual height scaling factor is applied.
2. **Dynamic Viewport Slice**:
   * Based on `scrollTop`, only rows inside the viewport + an overscan buffer of ~5 rows above and below are rendered (~30–45 rows total).
   * As the user scrolls, row elements are reused and updated via absolute `transform: translateY(...)`.
3. **Fixed DOM Footprint**:
   * DOM tree remains lightweight (~250 DOM nodes) regardless of whether 100 or 10,000,000 records exist.
   * Eliminates browser reflow overhead and guarantees **60 FPS** scroll smoothness.

---

## 5. Technical Pillar 3: Memory Buffer Management & Eviction

1. **Sliding Memory Window**:
   * Client retains a sliding window of **5,000 to 10,000 items** in JavaScript memory.
   * Enables instantaneous local search and pin position evaluation within the active viewing zone.
2. **Chunk Eviction Strategy**:
   * When memory usage approaches threshold (e.g. >20,000 cached records), distant non-visible chunks are evicted from the array and replaced with placeholder metadata.
   * If the user scrolls rapidly back up, the missing cursor slice is seamlessly refetched.

---

## 6. Demonstration in this Frontend Application

* **Synthetic Infinite Batch Generator**: Generates realistic batches of **500 records** on-demand when scrolling near the bottom of the container.
* **Virtualized Scrolling Component**: Built with high-performance virtual rendering demonstrating seamless 60 FPS scrolling through thousands of rows with zero DOM lag.
