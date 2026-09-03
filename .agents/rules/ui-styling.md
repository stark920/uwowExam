---
trigger: always_on
---

# UI Styling & Component Rules

1. Use Nuxt UI components (`UTable`, `UButton`, `UInput`, `UBadge`, `UModal`, `UCard`, `UToast`) wherever possible.
2. Prioritize Tailwind CSS utility classes across all Vue templates and components.
3. Avoid writing vanilla/pure `<style>` CSS blocks unless Tailwind cannot achieve the styling effect.
4. For virtualized tables and lists, ensure pinned rows stay sticky/fixed at the top.
