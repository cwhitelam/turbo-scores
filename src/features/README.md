# Feature-Based Organization

## Overview
This directory contains feature-based modules for the Turbo Scores application. Each feature is self-contained with its own components, hooks, types, and utilities.

## Structure
Each feature follows this structure:

```
features/
  ├── featureName/
  │   ├── components/     # UI components specific to this feature
  │   ├── hooks/          # Custom hooks for this feature
  │   ├── utils/          # Utility functions specific to this feature
  │   ├── types/          # TypeScript types/interfaces for this feature
  │   ├── services/       # API services specific to this feature
  │   ├── context/        # Context providers if needed
  │   └── index.ts        # Public API exports
```

## Sports Features
Sports features are organized by league:

```
features/
  ├── sports/
  │   ├── shared/         # Shared sports components/hooks/utilities
  │   ├── nba/            # NBA-specific components
  │   ├── nfl/            # NFL-specific components
  │   ├── mlb/            # MLB-specific components
  │   ├── nhl/            # NHL-specific components
  │   └── index.ts        # Exports all sports features
```

## Best Practices
1. Keep each feature isolated and independent
2. Only export what is needed through the index.ts file
3. Shared functionality should go in the `shared` directory
4. Use named exports for clarity
5. Cross-feature dependencies should be minimal and explicit 