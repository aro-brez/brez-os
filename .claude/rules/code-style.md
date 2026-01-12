---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Code Style Guidelines

## TypeScript
- Use strict TypeScript
- Prefer interfaces over types for object shapes
- Export types from dedicated files or alongside components
- Use `unknown` over `any` when type is truly unknown

## React Components
- Use functional components with hooks
- Component files should be PascalCase
- One component per file (except small related components)
- Props interfaces named `{ComponentName}Props`

## Styling
- Use Tailwind CSS classes
- Dark theme colors: bg-[#0D0D2A], bg-[#1a1a3e], bg-[#242445]
- Accent colors: text-[#e3f98a], text-[#65cdd8]
- Add `btn-satisfying` class to interactive buttons
- Use Framer Motion for animations

## File Organization
- Group by feature, not by type
- API routes in `src/app/api/`
- Shared components in `src/components/`
- Utilities in `src/lib/`

## Naming
- camelCase for variables and functions
- PascalCase for components and types
- SCREAMING_SNAKE_CASE for constants
- kebab-case for file names (except components)
