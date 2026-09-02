# Master Implementation Plan & Architecture Roadmap

## 1. Project Overview

This project is a high-performance **Frontend-Only Data Management System** built with **Vue 3**, **TypeScript**, and modern UI design principles.

All architectural decisions have been refined and finalized via the **Plan Grilling Session** and split into modular specifications inside `.agent/docs/`:

* 📖 **Part A Specification**: [`.agent/docs/PART_A_ARCHITECTURE.md`](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) — Data models, Relative Pinning Algorithm (Shift/Bump + Pin Absolute), Composite Multi-Column Sorting, CRUD confirmation flows, and Responsive Viewports (1920x1080 & 375x667).
* 📖 **Part B Specification**: [`.agent/docs/PART_B_SEARCH_SPIKE.md`](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_B_SEARCH_SPIKE.md) — Search request spike root cause analysis (5 → 500 req/min), 300ms Debounce + AbortController fix, and real-time Search Metrics HUD.
* 📖 **Part C Specification**: [`.agent/docs/PART_C_10M_SCALE.md`](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_C_10M_SCALE.md) — 10 Million row infinite scroll architecture, B-Tree cursor-based SQL pagination, DOM virtualization (~35 rendered rows), and sliding memory buffers.

---

## 2. Key Architecture Decisions Summary

| Area | Decision & Behavior | Reference Doc |
| :--- | :--- | :--- |
| **Tech Stack** | Vue 3 + Vite + TypeScript (FE-Only SPA) | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **State Persistence** | "Remember Mode" toggle (`localStorage` caching for CRUD/pins) | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **Relative Pinning** | **Shift/Bump** collision resolution + **Pin Absolute** visibility during search | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **Multi-Column Sort** | Composite multi-column sorting with priority badges (`#1`, `#2`) | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **CRUD Validation** | Add validation + 2-step Update confirmation dialog + Delete confirmation modal | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **Search Quick Fix** | 300ms Debounce + `AbortController` + live Metrics HUD | [Part B](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_B_SEARCH_SPIKE.md) |
| **10M Infinite Scroll** | DOM Virtualization + 500-batch dynamic generation + cursor pagination spec | [Part C](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_C_10M_SCALE.md) |
| **Responsive UX** | Desktop table (`1920x1080`) + Mobile hybrid Card/Table view toggle (`375x667`) | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |

---

## 3. Project Structure to Implement

```
src/
├── assets/
│   └── styles/
│       └── main.css             # Glassmorphic dark/light tokens, animations
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue        # Header with Logo, Remember toggle, HUD toggle
│   │   └── SearchAndFilter.vue  # Debounced search, multi-sort chips, mobile toggle
│   ├── table/
│   │   ├── VirtualDataTable.vue # Virtualized table for Desktop (1920x1080)
│   │   ├── VirtualRow.vue       # Virtual table row with pin badge & actions
│   │   └── TableHeader.vue      # Sortable headers with #1, #2 priority badges
│   ├── mobile/
│   │   ├── VirtualCardList.vue  # Virtualized Card list for Mobile (375x667)
│   │   └── VirtualCard.vue      # Touch-friendly card component
│   ├── modals/
│   │   ├── RecordFormModal.vue  # Add / Edit modal with validation
│   │   ├── ConfirmDialog.vue    # Two-step confirmation for Update & Delete
│   │   └── PinModal.vue         # 1-based relative position picker
│   └── metrics/
│       └── MetricsHUD.vue       # Part B: Live search reduction metrics visualizer
├── composables/
│   ├── useDataStore.ts          # Central reactive store & localStorage persistence
│   ├── usePinning.ts            # Relative pinning & collision shift algorithms
│   ├── useMultiSort.ts          # Composite multi-column sorting logic
│   ├── useDebouncedSearch.ts    # Debounce + AbortController + metrics tracker
│   └── useVirtualScroll.ts      # Custom lightweight virtual DOM scroller (60 FPS)
├── types/
│   └── index.ts                 # DataRecord, SortCriteria, SearchMetrics definitions
├── utils/
│   └── mockGenerator.ts         # Generates realistic employee records in 500-row batches
├── App.vue
└── main.ts
```

---

## 4. Implementation & Verification Checklist

- [x] **Architecture Grilling & Specification**: Completed and documented in `.agent/docs/`.
- [ ] **1. Project Scaffold**: Vue 3 + Vite + TypeScript setup.
- [ ] **2. Core Data Engine & Generator**: Seed 2,000 initial records + 500-item on-demand batch generator.
- [ ] **3. Relative Pinning Engine**: Shift/bump collision + always-visible relative pinning during search.
- [ ] **4. Multi-Column Sort Engine**: Composite sort with priority numbering and direction indicators.
- [ ] **5. DOM Virtualization**: Smooth 60 FPS virtual scroller with batch append.
- [ ] **6. CRUD Workflows & Popups**: Add form validation, 2-step Update confirmation, and Delete confirmation dialogs.
- [ ] **7. Part B Search Optimization & HUD**: 300ms debounce, AbortController, and real-time inspector HUD.
- [ ] **8. Responsive Viewports**: Validate desktop (`1920 x 1080 px`) and mobile (`375 x 667 px`) view toggle.
- [ ] **9. State Persistence**: Test "Remember Mode" toggle with `localStorage`.
