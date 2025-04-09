# Shared Sports Features

This directory contains components, hooks, utilities, and types that are shared across all sports features.

## Components

- `GameContainer`: The main container component for displaying game cards for any sport.

## Hooks

- `useSportsDataQuery`: Hook for fetching and managing sports data with optimized polling frequencies.

## Types

- Game-related types and interfaces.
- Sport-related types and enumerations.

## Utils

- Utility functions for game data processing.
- Shared sports-related helper functions.

## Constants

- Sport configuration constants.
- Shared sports-related values.

## Best Practices

1. Only place components, hooks, etc. here if they are used by multiple sport features.
2. Keep the API clean and consistent.
3. Document complex functionality.
4. Avoid sport-specific logic in shared components - use props or render props pattern instead. 