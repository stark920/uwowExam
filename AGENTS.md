# Workspace Guidelines

## UI & Styling Standard

- **Framework**: We use **Nuxt UI** (built on Tailwind CSS) for all UI components.
- **Styling**: Always use **Tailwind CSS utility classes** first. Do not write pure CSS unless Tailwind cannot fulfill the requirement.
- **Table Virtualization**: Smooth 60 FPS DOM virtualization with 500-batch dynamic append.
- **Relative Pinning Rules**: Pinned rows are interleaved into the result list at their exact 1-based relative display slots (e.g. Slot #1, Slot #3). When search is active, all records (including pinned) are filtered against the query first.
