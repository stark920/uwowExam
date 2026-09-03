# Master Implementation Plan & Architecture Roadmap

> [!IMPORTANT]
> **TOP RULE: Nuxt UI First Component Architecture**
> All components throughout this project must use **Nuxt UI (`@nuxt/ui`)** components and composables first (e.g. `useToast()`, `UApp`, `UButton`, `UInput`, `UModal`, `UBadge`, `UCard`, `UTable`, `USkeleton`, `UIcon`). Use custom vanilla/HTML components only if Nuxt UI does not support the specific requirement.

---

## 1. Project Overview

This project is a high-performance **Frontend-Only Data Management System** built with **Vue 3**, **Nuxt UI**, **Tailwind CSS**, **TypeScript**, and modern UI design principles.

All architectural decisions have been refined and finalized via the **Plan Grilling Session** and split into modular specifications inside `.agent/docs/`:

* 📖 **Part A Specification**: [`.agent/docs/PART_A_ARCHITECTURE.md`](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) — Data models, Relative Pinning Algorithm (Shift/Bump + Pin Absolute), Composite Multi-Column Sorting, CRUD confirmation flows, and Responsive Viewports (1920x1080 & 375x667).
* 📖 **Part B Specification**: [`.agent/docs/PART_B_SEARCH_SPIKE.md`](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_B_SEARCH_SPIKE.md) — Search request spike root cause analysis (5 → 500 req/min), 300ms Debounce + AbortController fix, and real-time Search Metrics HUD.
* 📖 **Part C Specification**: [`.agent/docs/PART_C_10M_SCALE.md`](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_C_10M_SCALE.md) — 10 Million row infinite scroll architecture, B-Tree cursor-based SQL pagination, DOM virtualization (~35 rendered rows), and sliding memory buffers.

---

## 2. Key Architecture Decisions Summary

| Area | Decision & Behavior | Reference Doc |
| :--- | :--- | :--- |
| **Tech Stack** | Vue 3 + Vite + Nuxt UI + Tailwind CSS + TypeScript (FE-Only SPA) | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **Component Standard**| **Nuxt UI First**: All UI elements (Toasts, Modals, Buttons, Inputs, Badges) built with Nuxt UI | [SKILL.md](file:///Users/genos/Documents/UWowExam/.agents/skills/nuxt-ui/SKILL.md) |
| **State Persistence** | "Remember Mode" toggle (`localStorage` caching for CRUD/pins) | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **Relative Pinning** | **Shift/Bump** collision resolution + **Fixed on Top** pinned rows/cards | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **Multi-Column Sort** | Composite multi-column sorting with priority badges (`#1`, `#2`) | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **CRUD Validation** | Add validation + 2-step Update confirmation dialog + Delete confirmation modal via `UModal` | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |
| **Search Quick Fix** | 300ms Debounce + `AbortController` + live Metrics HUD | [Part B](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_B_SEARCH_SPIKE.md) |
| **10M Infinite Scroll** | DOM Virtualization + 500-batch dynamic generation + cursor pagination spec | [Part C](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_C_10M_SCALE.md) |
| **Responsive UX** | Desktop table (`1920x1080`) + Mobile hybrid Card/Table view toggle (`375x667`) | [Part A](file:///Users/genos/Documents/UWowExam/.agent/docs/PART_A_ARCHITECTURE.md) |

---

## 3. Project Structure

```
src/
├── assets/
│   └── styles/
│       └── main.css             # Tailwind CSS & Nuxt UI theme imports
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue        # Header with Logo, Stats, Remember toggle, UButton actions
│   │   └── SearchAndFilter.vue  # UInput debounced search, UBadge sort chips, view toggle
│   ├── table/
│   │   ├── VirtualDataTable.vue # Fixed top pinned rows + 60 FPS virtualized scroller
│   │   ├── VirtualRow.vue       # Table row with UButton actions & UBadge pin indicators
│   │   └── TableHeader.vue      # Sortable headers with #1, #2 priority badges
│   ├── mobile/
│   │   ├── VirtualCardList.vue  # Mobile list with fixed top pinned cards
│   │   └── VirtualCard.vue      # Touch-friendly card component with UButton actions
│   ├── modals/
│   │   ├── RecordFormModal.vue  # UModal Add / Edit modal with type validation
│   │   ├── ConfirmDialog.vue    # UModal Two-step confirmation for Update & Delete
│   │   └── PinModal.vue         # UModal 1-based relative position picker
│   └── metrics/
│       └── MetricsHUD.vue       # Part B: Live search reduction metrics visualizer
├── composables/
│   ├── useDataStore.ts          # Central reactive store & Nuxt UI useToast() triggers
│   ├── usePinning.ts            # Relative pinning & collision shift algorithms
│   ├── useMultiSort.ts          # Composite multi-column sorting logic
│   ├── useDebouncedSearch.ts    # Debounce + AbortController + metrics tracker
│   └── useVirtualScroll.ts      # Custom lightweight virtual DOM scroller (60 FPS)
├── types/
│   └── index.ts                 # DataRecord, SortCriteria, SearchMetrics definitions
├── utils/
│   └── mockGenerator.ts         # Generates realistic employee records in 500-row batches
├── App.vue                      # Wrapped in <UApp> with Nuxt UI Toaster context
└── main.ts                      # Nuxt UI plugin registration
```

---

## 4. Implementation & Verification Checklist

- [x] **Architecture Grilling & Specification**: Completed and documented in `.agent/docs/`.
- [x] **Nuxt UI Skill & Rule Integration**: Installed official Nuxt UI skill (`.agents/skills/nuxt-ui/`) and workspace rules.
- [x] **Project Scaffold**: Vue 3 + Vite + Nuxt UI + Tailwind CSS + TypeScript setup.
- [x] **Core Data Engine & Generator**: Seed initial records + 500-item on-demand batch generator.
- [x] **Relative Pinning Engine**: Shift/bump collision + permanently Fixed on Top pinned rows.
- [x] **Multi-Column Sort Engine**: Composite sort with priority numbering and direction indicators.
- [x] **DOM Virtualization**: Smooth 60 FPS virtual scroller with batch append.
- [x] **CRUD Workflows & Nuxt UI Modals**: Form validation, 2-step Update confirmation, and Delete confirmation dialogs with Nuxt UI.
- [x] **Nuxt UI useToast() Feedback**: Integrated native `useToast()` notifications.
- [x] **Part B Search Optimization & HUD**: 300ms debounce, AbortController, and real-time inspector HUD.
- [x] **Responsive Viewports**: Desktop table and mobile card view.
- [x] **State Persistence**: "Remember Mode" toggle with `localStorage`.
