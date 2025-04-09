# Error Handling Examples

This document provides examples of how to use the error boundaries and error tracking hook together for comprehensive error handling.

## Basic Usage with useErrorTracking

```tsx
import React, { useState } from 'react';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import { useErrorTracking } from '@/hooks/useErrorTracking';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const { trackError, wrapWithErrorHandling } = useErrorTracking();

  // Example of manual error handling with trackError
  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      trackError(error, {
        componentName: 'UserProfile',
        context: { userId },
        silent: false
      });
      // You can still handle the error UI here or let the error boundary catch it
    }
  };

  // Example of using wrapWithErrorHandling
  const handleUpdateProfile = wrapWithErrorHandling(
    async (formData) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
    },
    {
      componentName: 'UserProfile.updateProfile',
      context: { userId }
    }
  );

  return (
    <div>
      {/* Component UI */}
    </div>
  );
}

// Wrap with error boundary
export default function UserProfileWithErrorHandling({ userId }) {
  return (
    <AppErrorBoundary componentName="UserProfile">
      <UserProfile userId={userId} />
    </AppErrorBoundary>
  );
}
```

## Using Error Tracking in Route Components

```tsx
import React, { useEffect } from 'react';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import { useErrorTracking } from '@/hooks/useErrorTracking';
import { useParams } from 'react-router-dom';

function GamePage() {
  const { gameId } = useParams();
  const { trackError } = useErrorTracking();

  useEffect(() => {
    // Log page views and potential errors
    try {
      // Analytics tracking code
      trackPageView(`/games/${gameId}`);
    } catch (error) {
      trackError(error, {
        componentName: 'GamePage',
        context: { gameId },
        silent: true // Don't show to user, just log
      });
    }
  }, [gameId, trackError]);

  return (
    <div>
      <AppErrorBoundary componentName="GameHeader">
        <GameHeader gameId={gameId} />
      </AppErrorBoundary>
      
      <AppErrorBoundary componentName="LiveScores">
        <LiveScores gameId={gameId} />
      </AppErrorBoundary>
      
      <AppErrorBoundary componentName="GameStats">
        <GameStats gameId={gameId} />
      </AppErrorBoundary>
    </div>
  );
}

export default function GamePageWithErrorHandling() {
  const { gameId } = useParams();
  
  return (
    <AppErrorBoundary componentName={`GamePage-${gameId}`}>
      <GamePage />
    </AppErrorBoundary>
  );
}
```

## Error Handling in Data Fetching Hooks

```tsx
import { useState, useEffect } from 'react';
import { useErrorTracking } from '@/hooks/useErrorTracking';

export function useGameData(gameId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { trackError } = useErrorTracking();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } 
      catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Track the error
        trackError(error, {
          componentName: 'useGameData',
          context: { gameId },
          silent: true
        });
        
        // Update state if component still mounted
        if (isMounted) {
          setError(error);
        }
      } 
      finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [gameId, trackError]);

  return { data, loading, error };
}
```

These examples demonstrate how to combine error boundaries with the error tracking hook for robust error handling throughout your application. 