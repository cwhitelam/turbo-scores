import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define the error interface
export interface ErrorWithTimestamp {
    message: string;
    stack?: string;
    timestamp: number;
    componentName?: string;
}

// Define the context interface
interface ErrorContextType {
    errors: ErrorWithTimestamp[];
    addError: (error: Error, componentName?: string) => void;
    clearErrors: () => void;
}

// Create the context with a default value
const ErrorContext = createContext<ErrorContextType>({
    errors: [],
    addError: () => { },
    clearErrors: () => { },
});

// Custom hook for using the error context
export const useErrorContext = () => useContext(ErrorContext);

// Provider component
interface ErrorProviderProps {
    children: ReactNode;
    maxErrors?: number;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
    children,
    maxErrors = 10
}) => {
    const [errors, setErrors] = useState<ErrorWithTimestamp[]>([]);

    const addError = useCallback((error: Error, componentName?: string) => {
        const errorWithTimestamp: ErrorWithTimestamp = {
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            componentName,
        };

        setErrors(prevErrors => {
            const newErrors = [errorWithTimestamp, ...prevErrors];
            // Limit the number of stored errors
            return newErrors.slice(0, maxErrors);
        });

        // You could also log to an external service here
        console.error('Error tracked in ErrorContext:', errorWithTimestamp);
    }, [maxErrors]);

    const clearErrors = useCallback(() => {
        setErrors([]);
    }, []);

    return (
        <ErrorContext.Provider value={{ errors, addError, clearErrors }}>
            {children}
        </ErrorContext.Provider>
    );
};

export default ErrorProvider; 