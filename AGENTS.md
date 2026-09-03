# Workspace Guidelines

## UI & Styling Standard

- **Framework**: We use **Nuxt UI** (built on Tailwind CSS) for all UI components.
- **Styling**: Always use **Tailwind CSS utility classes** first. Do not write pure CSS unless Tailwind cannot fulfill the requirement.
- **Table Virtualization**: Use Nuxt UI `UTable` with `:virtualize` for rendering large datasets at 60 FPS.
- **Pinning Rules**: Pinned rows must be pinned/fixed at the top of the table and mobile card views.
