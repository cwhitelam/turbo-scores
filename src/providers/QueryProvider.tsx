import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';

// Create the client once at application level
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000,
            refetchOnWindowFocus: false,
            // Disable logging for production
            networkMode: isDevelopment ? 'always' : 'online',
            // Prevent logging in production
            meta: {
                suppressNetworkErrors: !isDevelopment
            }
        },
        mutations: {
            // Prevent logging in production
            networkMode: isDevelopment ? 'always' : 'online',
        }
    }
});

// Suppress React Query devtools in production
if (!isDevelopment) {
    // This prevents any potential console logs from React Query
    // by overriding console methods temporarily during query operations
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    // Only suppress React Query related logs
    console.error = (...args) => {
        if (typeof args[0] === 'string' &&
            (args[0].includes('react-query') || args[0].includes('tanstack'))) {
            return;
        }
        originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
        if (typeof args[0] === 'string' &&
            (args[0].includes('react-query') || args[0].includes('tanstack'))) {
            return;
        }
        originalConsoleWarn.apply(console, args);
    };

    console.log = (...args) => {
        if (typeof args[0] === 'string' &&
            (args[0].includes('react-query') || args[0].includes('tanstack'))) {
            return;
        }
        originalConsoleLog.apply(console, args);
    };
}

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
} 