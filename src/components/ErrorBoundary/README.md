# Error Boundary Components

This directory contains React error boundary components for catching and displaying errors in a user-friendly way.

## Components

- `ErrorBoundary`: A class component that catches JavaScript errors in child components
- `ErrorFallback`: A fallback UI component that displays when an error is caught
- `withErrorBoundary`: A higher-order component (HOC) for easily wrapping components with error boundaries

## Usage Examples

### Basic Error Boundary

Wrap any component that might throw errors:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary componentName="MyComponent">
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Using withErrorBoundary HOC

Wrap individual components with error boundaries:

```tsx
import { withErrorBoundary } from '@/components/ErrorBoundary';

function MyComponent(props) {
  // Component that might throw errors
  return <div>...</div>;
}

// Create a wrapped version of the component
const MyComponentWithErrorBoundary = withErrorBoundary(MyComponent, {
  componentName: 'MyComponent'
});

// Use the wrapped component
function App() {
  return <MyComponentWithErrorBoundary />;
}
```

### Custom Fallback UI

Provide a custom fallback UI:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function CustomFallback({ error, resetError }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Try Again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary 
      componentName="MyComponent"
      fallback={<CustomFallback />}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Multiple Error Boundaries

Use multiple error boundaries to isolate errors to specific parts of your app:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <div>
      <ErrorBoundary componentName="Header">
        <Header />
      </ErrorBoundary>
      
      <ErrorBoundary componentName="MainContent">
        <MainContent />
      </ErrorBoundary>
      
      <ErrorBoundary componentName="Footer">
        <Footer />
      </ErrorBoundary>
    </div>
  );
}
```

This ensures that if one section crashes, the rest of the app continues to function. 