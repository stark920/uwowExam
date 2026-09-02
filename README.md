# UWow Data Management System (Vue 3 + TypeScript)

A high-performance **Frontend-Only Data Management Platform** featuring 60 FPS DOM virtualization, composite multi-column sorting, relative slot pinning, debounced search inspector, and responsive workflows.

---

## 📚 Technical Documentation & Architecture Specifications

Detailed specifications finalized during the architecture grilling are located in the [`.agent/`](.agent/) directory:

* 📄 [**Master Roadmap & Architecture (`.agent/PLAN.md`)**](.agent/PLAN.md)
* 📄 [**Part A: Architecture & Data Management (`.agent/docs/PART_A_ARCHITECTURE.md`)**](.agent/docs/PART_A_ARCHITECTURE.md)
* 📄 [**Part B: Search Spike 5 → 500 req/min Analysis & Fix (`.agent/docs/PART_B_SEARCH_SPIKE.md`)**](.agent/docs/PART_B_SEARCH_SPIKE.md)
* 📄 [**Part C: 10 Million Row Infinite Scroll Architecture (`.agent/docs/PART_C_10M_SCALE.md`)**](.agent/docs/PART_C_10M_SCALE.md)

---

## 🚀 Key Features

* **DOM Virtualization (60 FPS Guarantee)**: Maintains ~35 active DOM nodes in the viewport with seamless infinite scroll batch loading (500 rows/batch).
* **Relative Slot Pinning Engine**:
  * **Shift/Bump Collision Resolution:** Pinning to an occupied relative index shifts overlapping pinned records down by `+1`.
  * **Pin Absolute Search Behavior:** Pinned rows remain *always visible* at their assigned relative display slots; search results fill surrounding slots.
* **Composite Multi-Column Sorting**: Multi-column sorting with priority badges (`#1`, `#2`, `#3`) and direction arrows.
* **Part B Live Search Metrics HUD**: Collapsible inspector demonstrating real-time keystrokes, debounced calls (300ms), `AbortController` cancellations, and >80% traffic reduction.
* **CRUD Workflows**: Strict type validation modals + **2-step update confirmation dialog** + delete confirmation popup.
* **Remember Mode**: LocalStorage persistence toggle for CRUD changes, pins, and custom view modes.
* **Responsive Layout**: Desktop table (`1920 x 1080 px`) and mobile hybrid card/table toggle (`375 x 667 px`).

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
