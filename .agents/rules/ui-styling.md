---
trigger: always_on
---

# UI Styling & Component Rules

1. Use Nuxt UI components (`UButton`, `UInput`, `UBadge`, `UModal`, `UCard`, `USwitch`) wherever possible.
2. Prioritize Tailwind CSS utility classes across all Vue templates and components.
3. Avoid writing vanilla/pure `<style>` CSS blocks unless Tailwind cannot achieve the styling effect.
4. Relative Pinning: Interleave pinned records into the table/card list at their exact 1-based slot index without splitting the view.
5. Search & Filter: Filter all records by search query first before applying relative pin positions.
