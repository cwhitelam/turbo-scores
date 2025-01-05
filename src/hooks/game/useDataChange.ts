import { useCallback } from 'react';

export function useDataChange() {
    const hasDataChanged = useCallback(<T>(oldData: T, newData: T): boolean => {
        // For primitive types, use direct comparison
        if (oldData === newData) return false;

        // For null/undefined
        if (!oldData || !newData) return oldData !== newData;

        try {
            const oldJson = JSON.stringify(oldData);
            const newJson = JSON.stringify(newData);
            return oldJson !== newJson;
        } catch (error) {
            // If JSON.stringify fails (e.g., circular references), fall back to direct comparison
            return oldData !== newData;
        }
    }, []);

    return hasDataChanged;
} 