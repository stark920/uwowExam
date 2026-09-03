# UWow Data Management System (Vue 3 + Nuxt UI + TypeScript)

A high-performance **Frontend-Only Data Management Platform** featuring 60 FPS DOM virtualization, composite multi-column sorting, real relative slot pinning, debounced search inspector, delta-only persistence, and sliding memory window.

---

## 📚 Technical Documentation & Architecture Specifications

Detailed specifications finalized during the architecture review are located in the [`.agents/`](.agents/) directory:

* 📄 [**Master Roadmap & Architecture (`.agents/PLAN.md`)**](.agents/PLAN.md)
* 📄 [**Part A: Architecture & Data Management (`.agents/docs/PART_A_ARCHITECTURE.md`)**](.agents/docs/PART_A_ARCHITECTURE.md)
* 📄 [**Part B: Search Spike 5 → 500 req/min Analysis & Fix (`.agents/docs/PART_B_SEARCH_SPIKE.md`)**](.agents/docs/PART_B_SEARCH_SPIKE.md)
* 📄 [**Part C: 10 Million Row Memory & Virtualization Architecture (`.agents/docs/PART_C_10M_SCALE.md`)**](.agents/docs/PART_C_10M_SCALE.md)

---

## 🚀 Key Features

* **DOM Virtualization (60 FPS Guarantee)**: Maintains ~35 active DOM nodes in the viewport with seamless infinite scroll batch loading (500 rows/batch).
* **Real Relative Slot Pinning**:
  * **1-Based Relative Slot Weave:** Pinned rows are woven directly into the unified table/card list at their exact 1-based display slot (e.g. Slot #1 = row 1, Slot #3 = row 3).
  * **Shift/Bump Collision Resolution:** Pinning to an occupied slot shifts overlapping pins downward by `+1`.
  * **Search-Inclusive Filtering:** Search query filters all records (including pinned); non-matching records are excluded from view.
* **Composite Multi-Column Sorting**: Multi-column sorting with priority badges (`#1`, `#2`, `#3`) and direction arrows. Pinned items retain their relative positions while unpinned rows sort around them.
* **Sliding Memory Window (RAM Cap)**: Client memory is bounded to a sliding buffer (`MAX_RAM_CAP = 2500`), evicting distant batches to maintain a steady heap footprint.
* **Delta-Only Persistence (Remember Mode)**: Saves only `{ pins, edits, deletedIds, createdRecords }` in `localStorage` (<5 KB), completely eliminating quota blowups.
* **Zero-Clone ID Pipeline**: Search filtering and multi-sorting operate on lightweight ID arrays without object cloning.
* **Part B & C Performance & Memory Inspector HUD**: Live telemetry demonstrating keystroke reduction, debounced calls (300ms), `AbortController` cancellations, RAM usage, and delta storage size.
* **Nuxt UI Component Architecture**: Standardized on `@nuxt/ui` components (`UButton`, `UInput`, `UBadge`, `UCard`, `UModal`, `USwitch`, `useToast`).
* **Responsive Layout**: Desktop table (`1920 x 1080 px`) and mobile card view (`375 x 667 px`).

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Production Build
```bash
npm run build
```
