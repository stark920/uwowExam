# Master Implementation Plan & Architecture Roadmap

> [!IMPORTANT]
> **TOP RULE: Nuxt UI First Component Architecture**
> All components throughout this project must use **Nuxt UI (`@nuxt/ui`)** components and composables first (e.g. `useToast()`, `UApp`, `UButton`, `UInput`, `UModal`, `UBadge`, `UCard`, `USwitch`, `UIcon`). Use custom vanilla/HTML components only if Nuxt UI does not support the specific requirement.

---

## 1. Project Overview

This project is a high-performance **Frontend-Only Data Management System** built with **Vue 3**, **Nuxt UI**, **Tailwind CSS**, **TypeScript**, and modern UI design principles.

All architectural decisions have been refined and finalized via the **Plan Grilling Session** and split into modular specifications inside `.agents/docs/`:

* 📖 **Part A Specification**: [`.agents/docs/PART_A_ARCHITECTURE.md`](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_A_ARCHITECTURE.md) — Data models, Relative Pinning Algorithm (Shift/Bump + Real Relative Slot Interleaving), Composite Multi-Column Sorting, CRUD confirmation flows, and Responsive Viewports (1920x1080 & 375x667).
* 📖 **Part B Specification**: [`.agents/docs/PART_B_SEARCH_SPIKE.md`](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_B_SEARCH_SPIKE.md) — Search request spike root cause analysis (5 → 500 req/min), 300ms Debounce + AbortController fix, and real-time Search Metrics HUD.
* 📖 **Part C Specification**: [`.agents/docs/PART_C_10M_SCALE.md`](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_C_10M_SCALE.md) — 10 Million row target scale architecture, DOM virtualization (~35 rendered rows), sliding memory buffers, and delta-only persistence.

---

## 2. Key Architecture Decisions Summary

| Area | Decision & Behavior | Reference Doc |
| :--- | :--- | :--- |
| **Tech Stack** | Vue 3 + Vite + Nuxt UI (Standalone `router: false`) + Tailwind CSS + TypeScript | [Part A](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_A_ARCHITECTURE.md) |
| **Component Standard**| **Nuxt UI First**: All UI elements (Toasts, Modals, Buttons, Inputs, Badges) built with Nuxt UI | [SKILL.md](file:///Users/genos/Documents/UWowExam/.agents/skills/nuxt-ui/SKILL.md) |
| **State Persistence** | "Remember Mode" delta-only persistence (`localStorage` caching for pins, edits, creations <5 KB) | [Part C](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_C_10M_SCALE.md) |
| **Relative Pinning** | **Shift/Bump** collision resolution + **Real Relative Slot** interleaving into the unified table/card list (e.g. Slot #1 = row 1, Slot #3 = row 3) | [Part A](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_A_ARCHITECTURE.md) |
| **Search Filter** | Filters all working records (both pinned & unpinned); non-matching pinned records are excluded from search results | [Part A](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_A_ARCHITECTURE.md) |
| **Multi-Column Sort** | Composite multi-column sorting with priority badges (`#1`, `#2`) | [Part A](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_A_ARCHITECTURE.md) |
| **Zero-Clone Pipeline**| ID-based sorting and filtering without object cloning | [Part A](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_A_ARCHITECTURE.md) |
| **CRUD Validation** | Add validation + 2-step Update confirmation dialog + Delete confirmation modal via `UModal` | [Part A](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_A_ARCHITECTURE.md) |
| **Search Quick Fix** | 300ms Debounce + `AbortController` + live Metrics HUD | [Part B](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_B_SEARCH_SPIKE.md) |
| **10M Infinite Scroll** | Initial 500 records on load + onReachBottom appends +500 dynamically; stats badge displays `loaded / 10,000,000` | [Part C](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_C_10M_SCALE.md) |
| **RAM Window Cap** | Client memory sliding buffer capped at `MAX_RAM_CAP = 2500` rows | [Part C](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_C_10M_SCALE.md) |
| **Responsive UX** | Desktop table (`1920x1080`) + Mobile hybrid Card/Table view toggle (`375x667`) | [Part A](file:///Users/genos/Documents/UWowExam/.agents/docs/PART_A_ARCHITECTURE.md) |

---

## 3. Project Structure

```
src/
├── assets/
│   └── styles/
│       └── main.css             # Tailwind CSS & Nuxt UI theme imports
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue        # Header with Logo, Stats (loaded/10M), Remember toggle, UButton actions
│   │   └── SearchAndFilter.vue  # UInput debounced search, UBadge sort chips, view toggle
│   ├── table/
│   │   ├── VirtualDataTable.vue # Unified virtualized 60 FPS table with real relative slot pins
│   │   ├── VirtualRow.vue       # Table row with UButton actions & UBadge pin indicators
│   │   └── TableHeader.vue      # Sortable headers with #1, #2 priority badges
│   ├── mobile/
│   │   ├── VirtualCardList.vue  # Unified mobile virtualized card list
│   │   └── VirtualCard.vue      # Touch-friendly card component with UButton actions
│   ├── modals/
│   │   ├── RecordFormModal.vue  # UModal Add / Edit modal with type validation
│   │   ├── ConfirmDialog.vue    # UModal Two-step confirmation for Update & Delete
│   │   └── PinModal.vue         # UModal 1-based relative position picker
│   └── metrics/
│       └── MetricsHUD.vue       # Part B & C: Live search reduction & memory inspector
├── composables/
│   ├── useDataStore.ts          # Central reactive store, delta persistence & sliding RAM cap
│   ├── usePinning.ts            # Zero-clone ID pipeline & real relative slot weave
│   ├── useMultiSort.ts          # Composite multi-column sorting logic
│   ├── useDebouncedSearch.ts    # Debounce + AbortController + metrics tracker
│   └── useVirtualScroll.ts      # Custom lightweight virtual DOM scroller (60 FPS)
├── types/
│   └── index.ts                 # DataRecord, DeltaStoragePayload, SortCriteria, Metrics
├── utils/
│   └── mockGenerator.ts         # Generates realistic employee records in 500-row batches
├── views/
│   └── DataManagementView.vue   # Main data management view
├── App.vue                      # Wrapped in <UApp> with Nuxt UI Toaster context
└── main.ts                      # Nuxt UI standalone plugin registration
```

---

## 4. Implementation & Verification Checklist

- [x] **Architecture Review & Documentation**: All specifications refined and organized in `.agents/docs/`.
- [x] **Nuxt UI Skill & Rule Integration**: Installed official Nuxt UI skill (`.agents/skills/nuxt-ui/`) and workspace rules.
- [x] **Project Scaffold**: Vue 3 + Vite + Nuxt UI (standalone) + Tailwind CSS + TypeScript setup.
- [x] **Core Data Engine & Generator**: Seed 500 initial records on load + 500-item on-demand batch generator (`onReachBottom`).
- [x] **Real Relative Slot Pinning**: Shift/bump collision + interleaved into the unified list at 1-based display slots.
- [x] **Search Inclusive Filtering**: Full-column search filters all records (including pinned); non-matching pins do not stay on screen.
- [x] **Zero-Clone ID Pipeline**: Operates directly on ID arrays to prevent garbage collection pauses.
- [x] **Multi-Column Sort Engine**: Composite sort with priority numbering and direction indicators.
- [x] **DOM Virtualization**: Smooth 60 FPS virtual scroller with batch append.
- [x] **Sliding RAM Window**: Bounded to `MAX_RAM_CAP = 2500` active rows in memory.
- [x] **Delta-Only Persistence**: "Remember Mode" storing diffs (`<5 KB`) in `localStorage`.
- [x] **CRUD Workflows & Nuxt UI Modals**: Form validation, 2-step Update confirmation, and Delete confirmation dialogs with Nuxt UI.
- [x] **Nuxt UI useToast() Feedback**: Integrated native `useToast()` notifications.
- [x] **Part B & C Inspector HUD**: Real-time keystrokes, debounce cancellations, and memory telemetry.
- [x] **Responsive Viewports**: Desktop table and mobile card view.
